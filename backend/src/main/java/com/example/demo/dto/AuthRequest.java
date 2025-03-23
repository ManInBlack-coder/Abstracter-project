package com.example.demo.dto;

public class AuthRequest {
    private String email;
    private String username;
    private String password;

    // Default constructor
    public AuthRequest() {}

    // Constructor for login
    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Constructor for registration
    public AuthRequest(String email, String username, String password) {
        this.email = email;
        this.username = username;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
} 