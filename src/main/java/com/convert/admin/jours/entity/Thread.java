package com.convert.admin.jours.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Thread {

    @Id
    @GeneratedValue
    private Long id;

    @Setter
    private String name;
    private String address;

    @CreatedDate
    private LocalDateTime createdAt;
}
