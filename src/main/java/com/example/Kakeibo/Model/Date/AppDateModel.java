package com.example.Kakeibo.Model.Date;

import java.time.LocalDate;
import java.time.YearMonth;

public class AppDateModel {

    private final LocalDate date;

    public AppDateModel(){

        this.date=LocalDate.now();
    }

    public AppDateModel(LocalDate date){

        this.date = date;
    }

    public int getYear(){

        return date.getYear();
    }

    public int getMonth()
    {
        return date.getMonthValue();
    }

    public int getDay()
    {
        return date.getDayOfMonth();
    }

    public YearMonth getYearMonth()
    {
        return YearMonth.from(date);
    }

    //年月指定（月初固定）
    public  static  AppDateModel of(int year,int month) {
        return  new AppDateModel(LocalDate.of(year,month,1));
    }

    public LocalDate getDate() {

        return date;
    }

    public AppDateModel prevMonth() {
        return new AppDateModel(date.minusMonths(1));
    }

    public AppDateModel nextMonth() {
        return new AppDateModel(date.plusMonths(1));
    }

    public String toYearMonthParam() {
        return  "year=" + getYear() + "&month=" + getMonth();
    }
}


