package com.devteria.identityservice.service;

import java.util.*;

import com.devteria.identityservice.dto.request.UserCreationWithRolesRequest;
import jakarta.mail.MessagingException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.devteria.identityservice.constant.PredefinedRole;
import com.devteria.identityservice.dto.request.UserCreationRequest;
import com.devteria.identityservice.dto.request.UserUpdateRequest;
import com.devteria.identityservice.dto.response.UserResponse;
import com.devteria.identityservice.entity.Role;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.mapper.UserMapper;
import com.devteria.identityservice.repository.RoleRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }



    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }


    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createUserWithRoles(UserCreationWithRolesRequest request) {

        // Kiểm tra id đã tồn tại chưa
        if (userRepository.existsById(request.getId())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Validate roles
        Set<Role> roles = roleRepository.findByNameIn(request.getRoleNames());
        if (roles.size() != request.getRoleNames().size()) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        User user = userMapper.toUser(request);
        user.setId(request.getId());  // Set id từ request
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }

    public String resetPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Tạo mật khẩu mới ngẫu nhiên
        String newPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Gửi email chứa mật khẩu mới
        String content = "Mật khẩu mới của bạn là: " + newPassword;
        try {
            emailService.sendHtmlEmail(email, "Mật khẩu mới", content);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }

        return newPassword;
    }

    private String generateRandomPassword() {
        // Tạo mật khẩu 8 ký tự ngẫu nhiên
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }


}
