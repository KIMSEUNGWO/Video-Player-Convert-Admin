package com.convert.admin.jours.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UpdateThreadCountRequest {
    private int coreThreads;
    private int maxThreads;
}