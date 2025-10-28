package com.devteria.identityservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileStorageService {
    @Value("${app.file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Không thể lưu file rỗng!");
        }

        try {
            // Tạo tên file ngẫu nhiên
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String fileName = UUID.randomUUID() + fileExtension;

            // Tạo thư mục nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Lưu file vào thư mục uploads
            Path targetLocation = uploadPath.resolve(fileName); // resolve ghép tên file vào uploadPath
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu file: " + e.getMessage(), e);
        }
    }


    public Resource loadFileAsResource(String fileName) {

        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            log.info("Trying to load file: {}", fileName);
            log.info("Full file path: {}", filePath);
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + fileName, e);
        }
    }
}