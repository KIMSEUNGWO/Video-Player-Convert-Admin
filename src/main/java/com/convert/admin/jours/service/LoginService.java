package com.convert.admin.jours.service;

import com.convert.admin.jours.dto.SignupRequest;
import com.convert.admin.jours.entity.Admin;
import com.convert.admin.jours.jparepository.AdminJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class LoginService {

    private final BCryptPasswordEncoder encoder;
    private final AdminJpaRepository adminJpaRepository;

    public void signup(SignupRequest signupRequest) {
        System.out.println("signupRequest = " + signupRequest);
        Admin saveAdmin = Admin.builder()
            .username(signupRequest.getUsername())
            .password(encoder.encode(signupRequest.getPassword()))
            .build();
        adminJpaRepository.save(saveAdmin);
    }
}
