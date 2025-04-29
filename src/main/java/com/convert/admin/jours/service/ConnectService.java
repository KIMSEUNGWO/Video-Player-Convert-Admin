package com.convert.admin.jours.service;

import com.convert.admin.jours.dto.ThreadCountDto;
import com.convert.admin.jours.dto.ThreadCountRequest;
import com.convert.admin.jours.dto.ThreadDto;
import com.convert.admin.jours.dto.UpdateThreadCountRequest;
import com.convert.admin.jours.entity.Thread;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

@Slf4j
@Service
public class ConnectService {

    public boolean checkConnect(String url) {
        return RestClient.create(url + "/api/connect/check").get()
            .retrieve()
            .toBodilessEntity()
            .getStatusCode().is2xxSuccessful();
    }

    public List<ThreadCountDto> getStats(List<Thread> threads) {
        if (threads == null || threads.isEmpty()) return List.of();
        ExecutorService executorService = Executors.newFixedThreadPool(threads.size());

        var futures = threads.stream()
            .map(thread -> CompletableFuture.supplyAsync(() ->
                    RestClient.create(thread.getAddress() + "/api/connect/stat").get()
                        .retrieve()
                        .body(ThreadCountRequest.class)
                , executorService))
            .toList();

        List<ThreadCountDto> result = new ArrayList<>(threads.size());

        for (int i = 0; i < threads.size(); i++) {
            try {
                var response = futures.get(i).get(2, TimeUnit.SECONDS);
                if (response == null) {
                    result.add(new ThreadCountDto(threads.get(i)));
                } else {
                    result.add(new ThreadCountDto(threads.get(i), response));
                }
            } catch (Exception e) {
                log.error("스레드 상태 조회 중 오류 발생: {}", e.getMessage());
                result.add(new ThreadCountDto(threads.get(i)));

            }
        }
        return result;
    }

    public boolean updateCoreThread(Thread thread, UpdateThreadCountRequest request) {
        return RestClient.create(thread.getAddress() + "/api/thread/threads").put()
            .body(request)
            .retrieve()
            .toBodilessEntity()
            .getStatusCode().is2xxSuccessful();
    }

    private MultiValueMap<String, Object> wrapper(UpdateThreadCountRequest request) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("coreThreads", request.getCoreThreads());
        body.add("maxThreads", request.getMaxThreads());
        return body;
    }

    public boolean stop(Thread thread) {
        return threadControl(thread.getAddress() + "/api/thread/stop");
    }

    public boolean forceStop(Thread thread) {
        return threadControl(thread.getAddress() + "/api/thread/force-stop");
    }

    public boolean start(Thread thread) {
        return threadControl(thread.getAddress() + "/api/thread/start");
    }

    private boolean threadControl(String url) {
        return RestClient.create(url).post()
            .retrieve()
            .toBodilessEntity()
            .getStatusCode()
            .is2xxSuccessful();
    }
}
