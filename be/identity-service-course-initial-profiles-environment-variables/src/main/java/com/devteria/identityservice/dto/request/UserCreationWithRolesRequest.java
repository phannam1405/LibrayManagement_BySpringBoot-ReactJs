package com.devteria.identityservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationWithRolesRequest {
    private String id;
    private String username;
    private String password;
    String email;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private Set<String> roleNames;
}