package com.stayfinder.exception;

public class StayFinderException extends RuntimeException {

    public StayFinderException(String message) {
        super(message);
    }

    public StayFinderException(String message, Throwable cause) {
        super(message, cause);
    }
}
