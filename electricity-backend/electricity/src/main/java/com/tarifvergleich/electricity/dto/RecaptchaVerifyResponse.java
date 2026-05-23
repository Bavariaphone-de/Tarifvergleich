package com.tarifvergleich.electricity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RecaptchaVerifyResponse {

    private boolean success;
    private float score;
    private String action;

    @JsonProperty("challenge_ts")
    private String challengeTs;

    private String hostname;

    public boolean isSuccess()      { return success; }
    public float getScore()         { return score; }
    public String getAction()       { return action; }
    public String getChallengeTs()  { return challengeTs; }
    public String getHostname()     { return hostname; }
}
