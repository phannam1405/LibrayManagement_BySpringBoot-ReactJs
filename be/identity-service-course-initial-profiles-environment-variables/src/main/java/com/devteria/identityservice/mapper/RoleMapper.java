package com.devteria.identityservice.mapper;

import com.devteria.identityservice.dto.request.UserUpdateRequest;
import com.devteria.identityservice.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.devteria.identityservice.dto.request.RoleRequest;
import com.devteria.identityservice.dto.response.RoleResponse;
import com.devteria.identityservice.entity.Role;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "permissions", ignore = true)
    @Mapping(target = "name", ignore = true)
    void updateRole(@MappingTarget Role role, RoleRequest request);
}
