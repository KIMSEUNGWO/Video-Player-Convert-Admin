package com.convert.admin.jours.controller;

import com.convert.admin.jours.dto.SignupRequest;
import com.convert.admin.jours.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    @GetMapping("/login")
    public String loginPage() {
        return "joinForm";
    }

    @GetMapping("/signup")
    public String signupPage() {
        return "signupForm";
    }

    @PostMapping("/signup")
    public String signup(@ModelAttribute SignupRequest signupRequest) {
        loginService.signup(signupRequest);
        return "redirect:/login";
    }
}
