package com.convert.admin.jours.service;

import com.convert.admin.jours.dto.RenameRequest;
import com.convert.admin.jours.dto.ThreadCountDto;
import com.convert.admin.jours.dto.ThreadDto;
import com.convert.admin.jours.dto.UpdateThreadCountRequest;
import com.convert.admin.jours.entity.Thread;
import com.convert.admin.jours.jparepository.ThreadJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ThreadService {

    private final ThreadJpaRepository threadJpaRepository;
    private final ConnectService connectService;

    public List<ThreadCountDto> getThreads() {
        List<Thread> threads = threadJpaRepository.findAll();
        return connectService.getStats(threads);
    }

    public void save(ThreadDto threadDto) {
        Thread saveThread = Thread.builder()
            .name(threadDto.getName())
            .address(threadDto.getAddress())
            .build();
        threadJpaRepository.save(saveThread);
    }

    public void delete(Long id) {
        threadJpaRepository.deleteById(id);
    }

    public void rename(Long id, RenameRequest request) {
        threadJpaRepository.findById(id).ifPresent(thread -> thread.setName(request.getName()));
    }

    public boolean updateThreadCount(Long id, UpdateThreadCountRequest request) {
        Thread thread = findByThreadId(id);
        return connectService.updateCoreThread(thread, request);
    }

    private Thread findByThreadId(Long id) {
        return threadJpaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Thread not found"));
    }

    public boolean stop(Long id) {
        Thread thread = findByThreadId(id);
        return connectService.stop(thread);
    }

    public boolean forceStop(Long id) {
        Thread thread = findByThreadId(id);
        return connectService.forceStop(thread);
    }

    public boolean start(Long id) {
        Thread thread = findByThreadId(id);
        return connectService.start(thread);
    }
}
