package com.convert.admin.jours.dto;

import com.convert.admin.jours.enums.ThreadStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ThreadCountRequest {

    private int coreThreads;
    private int maxThreads;
    private int activeThreads;
    private int queueSize;
    private ThreadStatus status;
}
