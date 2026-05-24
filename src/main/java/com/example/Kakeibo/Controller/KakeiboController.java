package com.example.Kakeibo.Controller;

import com.example.Kakeibo.Model.Date.AppDateModel;
import com.example.Kakeibo.Service.TransactionService;
import com.example.Kakeibo.dto.MonthlysummaryDto;
import com.example.Kakeibo.dto.TransactionFrom;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;


@Controller
@RequestMapping("/transaction")
public class KakeiboController {
    private final TransactionService service;

    public KakeiboController(TransactionService service){

        this.service = service;
    }
    //トップページ
//    @GetMapping("/")
//    public String top(Model model) {
//
//        AppDateModel today = new AppDateModel();
//
//
//        YearMonth yearMonth = today.getYearMonth();
//        int year = today.getYear();
//        int month = today.getMonth();
//
//        LocalDate firstDay = YearMonth.of(year, month).atDay(1);
//        LocalDate lastday = yearMonth.atEndOfMonth();
//        int startDayOfWeek = firstDay.getDayOfWeek().getValue();
//// 月=1 ... 日=7
//        List<LocalDate> days = new ArrayList<>();
//        List<Integer> calendar = new ArrayList<>();
//
//        for (int i = 1; i < startDayOfWeek; i++) {
//            calendar.add(null); // 空白
//        }
//
//        for (int day = 1; day <=  lastday; day++) {
//            calendar.add(day);
//        }
//
//        while (calendar.size() < 35) {
//            calendar.add(null);
//        }
//
//
//        for(int i = 1; i <= yearMonth.lengthOfMonth(); i++){
//            days.add(yearMonth.atDay(i));
//        }
//
//
//            MonthlysummaryDto summary=
//                    service.getMonthlySummary(year,month);
//
//            model.addAttribute("summary",summary);
//            model.addAttribute("year",year);
//            model.addAttribute("month",month);
//        model.addAttribute("calendar", calendarList);
//        model.addAttribute("today", today);
//        model.addAttribute("days", days);
//
//        return "top";
//    }

    //日付画面
//    @GetMapping("/transaction/{date}")
//    public String byDate(@PathVariable String date, Model model) {
//
//        LocalDate targetDate ;
//        try{
//            targetDate = LocalDate.parse(date);
//        } catch (Exception e){
//            return "redirect:/";
//        }
//
//        List<TransactionDto> list = service.findByDate(targetDate);
//
//        TransactionDto tranDto
//                = new TransactionDto();
//        tranDto.setDate(targetDate); // ←ここ重要（自動入力）
//
//        model.addAttribute("transactionList", list);
//        model.addAttribute("transaction", tranDto);
//        model.addAttribute("targetDate", targetDate);
//
//        return "date";
//    }

    @GetMapping("/transactions")
    public String list(
            @RequestParam(required = false) LocalDate date,
            Model model) {
                TransactionFrom tranDto = new TransactionFrom();
        if (date != null) {
            tranDto.setDate(date);
        }

        model.addAttribute("transaction",tranDto);

        List<TransactionFrom> list;

        if (date != null) {
            list = service.findByDate(date);
        } else {
            list = service.findAll();
        }

        model.addAttribute("transactions", list);
        model.addAttribute("selectedDate", date);

        return "transactions";
    }


//    @GetMapping("/transactions")
//    public String expenditureAddList(  Model model) {
//        TransactionDto tranDto = new TransactionDto();
//        model.addAttribute("transaction",tranDto);
//        model.addAttribute("transactionList", service.findAll());
//
//        return "transactions";
//    }

    @PostMapping("/transactions")
    public String add(@Valid @ModelAttribute ("transaction") TransactionFrom tranDto, BindingResult result, Model model)  {
       if(result.hasErrors()){
           model.addAttribute("transactionList",service.findAll());
            return "transactions";
       }
        service.create(tranDto);
        return "redirect:/transactions";
    }


    @PostMapping("/transactions/id/{id}/delete")
    public String remove(@PathVariable Integer id) {
        service.delete(id);

        return "redirect:/transactions";

    }

    @GetMapping("/transactions/id/{id}")
    public String edit(@PathVariable Integer id, Model model) {
        TransactionFrom tranDto = service.findById(id);
        model.addAttribute("transaction",tranDto);
                return "transaction-edit";
    }

    @PostMapping("/transactions/id/{id}")
    public String update(@Valid @ModelAttribute ("transaction") TransactionFrom form,
                         BindingResult result)
    {
        if (result.hasErrors()){

            TransactionFrom original = service.findById(form.getId());

            if (form.getDate() == null){
                form.setDate(original.getDate());
            }
            return "transaction-edit";
        }
        service.update(form);
        return "redirect:/transactions";

    }

    @GetMapping("/summary")
    public String summary(@RequestParam(required = false) Integer year,
                          @RequestParam(required = false) Integer month,
                          Model model){

        MonthlysummaryDto summary=
                service.getMonthlySummary(year,month);

        model.addAttribute("summary",summary);
        model.addAttribute("year",year);
        model.addAttribute("month",month);
        return "summary";
    }

}


