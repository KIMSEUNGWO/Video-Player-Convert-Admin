package com.convert.admin.jours;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class JoursApplication {

	public static void main(String[] args) {
		SpringApplication.run(JoursApplication.class, args);
	}

}
