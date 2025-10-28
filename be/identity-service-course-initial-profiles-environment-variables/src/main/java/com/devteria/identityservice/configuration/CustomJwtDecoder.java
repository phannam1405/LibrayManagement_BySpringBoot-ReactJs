package com.devteria.identityservice.configuration;

import java.text.ParseException;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.devteria.identityservice.dto.request.IntrospectRequest;
import com.devteria.identityservice.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;

// class này cấu hình giải mã (decode) và xác thực token JWT trong hệ thống Spring Security.
@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey; //khóa bí mật dùng để ký và xác thực JWT với thuật toán HS512(tối thiểu 512 bit (64 bytes)

    @Autowired
    private AuthenticationService authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        try {
            //Xác thực token (kiểm tra hợp lệ) thông qua service
            var response = authenticationService.introspect(
                    IntrospectRequest.builder().token(token).build());

            if (!response.isValid()) throw new JwtException("Token invalid");
        } catch (JOSEException | ParseException e) {
            throw new JwtException(e.getMessage());
        }

        //Giải mã nội dung JWT để Spring Security có thể đọc được payload bên trong token.
        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }
}
