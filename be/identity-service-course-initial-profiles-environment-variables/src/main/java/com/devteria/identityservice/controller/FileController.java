package com.devteria.identityservice.controller;

import com.devteria.identityservice.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/files/{fileName:.+}")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class FileController {
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        log.info("Received request for file: {}", fileName);
        Resource file = fileStorageService.loadFileAsResource(fileName);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}