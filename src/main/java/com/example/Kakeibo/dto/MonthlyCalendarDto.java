package com.example.Kakeibo.dto;


import java.util.List;

public class MonthlyCalendarDto {

        private int year;
        private int month;

        public  MonthlyCalendarDto(int year , int month) {
            this.year = year;
            this.month = month;
        }

        // 35マス（カレンダー用）
        private List<DaySummaryDto> days;

        public int getYear() {
            return year;
        }

        public void setYear(int year) {
            this.year = year;
        }

        public int getMonth() {
            return month;
        }

        public void setMonth(int month) {

            this.month = month;
        }

        // getter/setter
    }

