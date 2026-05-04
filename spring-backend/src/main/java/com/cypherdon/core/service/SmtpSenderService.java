package com.cypherdon.core.service;

import com.cypherdon.core.model.EmailTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SmtpSenderService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(EmailTask task) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(task.getRecipientEmail());
        message.setSubject(task.getSubject());
        message.setText(task.getBody());
        
        // Note: For attachments, you'd use MimeMessage and MimeMessageHelper.
        // For this implementation, we are sending the core text and treating resumeUrl as a link in the body
        // or a future enhancement to download the S3 byte stream and attach it.
        if (task.getResumeUrl() != null && !task.getResumeUrl().isEmpty()) {
            message.setText(task.getBody() + "\n\nMy Resume: " + task.getResumeUrl());
        }

        mailSender.send(message);
    }
}
