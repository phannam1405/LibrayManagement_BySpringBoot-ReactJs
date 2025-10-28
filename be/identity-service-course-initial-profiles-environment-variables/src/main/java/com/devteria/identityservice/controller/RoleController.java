package com.devteria.identityservice.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.RoleRequest;
import com.devteria.identityservice.dto.response.RoleResponse;
import com.devteria.identityservice.service.RoleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {
    RoleService roleService;

    @PostMapping
    ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }

    @DeleteMapping("/{role}")
    ApiResponse<Void> delete(@PathVariable String role) {
        roleService.delete(role);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{roleName}")
    public ApiResponse<RoleResponse> getRole(@PathVariable String roleName) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.getRole(roleName))
                .build();
    }

    @PutMapping("/{roleName}")
    public ApiResponse<RoleResponse> update(
            @PathVariable String roleName,
            @Valid @RequestBody RoleRequest request
    ) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.updateRole(roleName, request))
                .build();
    }
}
