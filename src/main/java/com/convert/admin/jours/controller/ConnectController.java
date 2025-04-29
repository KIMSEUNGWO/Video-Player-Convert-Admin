package com.convert.admin.jours.controller;

import com.convert.admin.jours.service.ConnectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/connect")
public class ConnectController {

    private final ConnectService connectService;

    @GetMapping("/check")
    public ResponseEntity<Void> check(@RequestParam String url) {
        System.out.println("url = " + url);
        try {
            boolean isConnect = connectService.checkConnect(url);
            if (isConnect) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


}
