package com.convert.admin.jours.dto;

import com.convert.admin.jours.entity.Thread;
import com.convert.admin.jours.enums.ThreadStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ThreadCountDto {

    private Long id;
    private String name;
    private String address;
    private int coreThreads;
    private int maxThreads;
    private int activeThreads;
    private int queuedThreads;
    private ThreadStatus status;

    public ThreadCountDto(Thread thread, ThreadCountRequest body) {
        this.id = thread.getId();
        this.name = thread.getName();
        this.activeThreads = body.getActiveThreads();
        this.address = thread.getAddress();
        this.coreThreads = body.getCoreThreads();
        this.maxThreads = body.getMaxThreads();
        this.queuedThreads = body.getQueueSize();
        this.status = body.getStatus();
    }

    public ThreadCountDto(Thread thread) {
        this.name = thread.getName();
        this.address = thread.getAddress();
    }
}
