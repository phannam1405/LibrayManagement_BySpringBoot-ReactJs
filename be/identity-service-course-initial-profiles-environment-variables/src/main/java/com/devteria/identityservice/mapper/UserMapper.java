package com.devteria.identityservice.mapper;

import com.devteria.identityservice.dto.request.UserCreationWithRolesRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.devteria.identityservice.dto.request.UserCreationRequest;
import com.devteria.identityservice.dto.request.UserUpdateRequest;
import com.devteria.identityservice.dto.response.UserResponse;
import com.devteria.identityservice.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    @Mapping(source = "id", target = "id")
    @Mapping(target = "email", source = "email")
    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);



    @Mapping(target = "password", ignore = true) // Sẽ set password sau
    @Mapping(target = "roles", ignore = true) // Sẽ set roles sau
    User toUser(UserCreationWithRolesRequest request);
}
