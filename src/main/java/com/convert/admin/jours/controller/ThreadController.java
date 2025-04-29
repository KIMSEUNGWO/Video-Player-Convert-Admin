package com.convert.admin.jours.controller;

import com.convert.admin.jours.dto.*;
import com.convert.admin.jours.service.ThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/threads")
public class ThreadController {

    private final ThreadService threadService;

    @GetMapping
    public ResponseEntity<List<ThreadCountDto>> getThreads() {
        return ResponseEntity.ok(threadService.getThreads());
    }

    @PostMapping
    public ResponseEntity<Void> createThread(@RequestBody ThreadDto threadDto) {
        threadService.save(threadDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThread(@PathVariable Long id) {
        threadService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/name")
    public ResponseEntity<Void> updateThreadName(@PathVariable Long id, @RequestBody RenameRequest request) {
        threadService.rename(id, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/threads")
    public ResponseEntity<Void> updateCoreThreads(@PathVariable Long id, @RequestBody UpdateThreadCountRequest request) {
        System.out.println("ThreadController.updateCoreThreads");
        System.out.println("id = " + id);
        System.out.println("request = " + request);
        boolean changed = threadService.updateThreadCount(id, request);
        if (changed) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("{id}/stop")
    public ResponseEntity<Void> stopThread(@PathVariable Long id) {
        boolean stopped = threadService.stop(id);
        if (stopped) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("{id}/force-stop")
    public ResponseEntity<Void> forceStopThread(@PathVariable Long id) {
        boolean stopped = threadService.forceStop(id);
        if (stopped) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("{id}/start")
    public ResponseEntity<Void> startThread(@PathVariable Long id) {
        boolean stopped = threadService.start(id);
        if (stopped) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

}
