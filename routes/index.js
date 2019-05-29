var express = require('express');
var router = express.Router();

var webdriver = require('../node_modules/selenium-webdriver');
var By = require('selenium-webdriver').By;
let $ = require('selenium-query');
let cheerio = require('cheerio');
var request = require('request');

var url = "https://onland.kbstar.com/quics?page=okbland&QSL=F";
function activate(driver) {

  var largeArea = {
    "서울특별시":"11",
    "경기도":"41",
    "인천":"28",
    "부산광역시":"26",
    "대전광역시":"30",
    "대구광역시":"27",
    "광주광역시":"29",
    "강원도":"42",
    "울산광역시":"31",
    "충청남도":"44",
    "충청북도":"43",
    "경상남도":"48",
    "경상북도":"47",
    "전라남도":"46",
    "전라북도":"45",
    "제주특별자치도":"50",
    "세종특별자치시":"36"
  }
  var middleArea = {
    '계양구' : '28245'
  }
  var smallArea = {
    '효성동' : '28245101'
  }

  setTimeout(function(){
    // 팝업창 X 버튼
    // driver.findElement(By.xpath('//*[@id="layer1"]/button')).click();
    // 시세조회 버튼 click
    driver.findElement(By.xpath('//*[@id="okblandMainForm"]/div[2]/div[3]/div[2]/ul/li[2]/a')).click();  
  }, 500)

  console.log(1);
  setTimeout(function(){
    $(driver).find('#대지역명').val(largeArea.인천);
    driver.executeScript("goStutDongList('"+largeArea.인천+"')");
    $(driver).find("#아파트").click();        
  }, 1300)

  setTimeout(function(){
    $(driver).find('#중지역명').val(middleArea.계양구);
    driver.executeScript("goStutDongList('"+middleArea.계양구+"')");
    $(driver).find("#아파트").click();
  }, 1800)
  console.log(3);
  setTimeout(function(){
    $(driver).find('#소지역명').val(smallArea.효성동);
    driver.executeScript("goStutDongList('"+smallArea.효성동+"')");
    $(driver).find("#아파트").click();
  }, 2500)

  setTimeout(function(){
    driver.executeScript("siseInq(1)");
  }, 3000)
  console.log(4);
}

function k(driver, forCnt) {
  setTimeout(function(){
    driver.findElement(By.css('#resultArea')).getAttribute('innerHTML').then(function(html){

      var $ = cheerio.load(html);

      var li = $("#siseInpResult li");
      var arr = new Array();
      // 실제 저장
      var saveArr = [{}];
      var temp = 0;
      console.log("페이지 개수 = " + forCnt);
      console.log("li 개수 = "+li.length);
      console.log("세번째 tr 개수 = "+$("#siseInpResult > li:nth-child("+3+") > div.tbl_list.type2 > table > tbody > tr").length);

      for(var i=1; i<=li.length; i++) {
    
        var cnt = $("#siseInpResult > li:nth-child("+i+") > div.tbl_list.type2 > table > tbody > tr").length;
        var address = $("#siseInpResult > li:nth-child("+i+") > div.tit_h3.sch_h3 > div.left > span").text();
        var apart = $("#siseInpResult > li:nth-child("+i+") > div.tit_h3.sch_h3 > div.left > h3").text();

        // li 구분
        for(var j=1; j<=cnt; j++) {
          var result = $("#siseInpResult > li:nth-child("+i+") > div.tbl_list.type2 > table > tbody > tr:nth-child("+j+")").text();
          // console.log(result);                      
          arr[temp] = result.split("        ");
          arr[temp][0] = arr[temp][1].split("/")[0];
          
          saveArr[temp] = {
            "면적" : arr[temp][0],
            "전용면적" : arr[temp][1],
            "매매하한가" : arr[temp][2],
            "매매일반거래가" : arr[temp][3],
            "매매상한가" : arr[temp][4],
            "전세하한가" : arr[temp][5],
            "전세일반거래가" : arr[temp][6],
            "전세상한가" : arr[temp][7],
            "월세보증금액" : arr[temp][8],
            "월세금액" : arr[temp][9],
            "주소" : address,
            "단지명" : apart
          }
          console.log(saveArr[temp]);
          temp++;
        } // j for
      } // i for
      return 
    }).then(function(forCnt){
      if(forCnt != 1) {
        driver.executeScript('siseInq(2)');
      }
    })
    
  }, 300)
}

router.get('/', function(req, res, next){
  
});

/* GET home page. */
router.get('/t', function(req, res, next) {

  (async function setting() {

    // 켜지는 속도를 맞추기 위해 url 열고 1초뒤 setting 함수 실행
    try { 
      var driver = new webdriver.Builder().forBrowser('chrome').build();
      await driver.get(url);
      await activate(driver);
      console.log(5);

      
      setTimeout(function(){

        driver.findElement(By.xpath('//*[@id="resultArea"]/div[3]')).getAttribute('innerHTML').then(function(data){
          // console.log(data);
          var $ = cheerio.load(data);

          var forCnt = $("#pagingArea")[0].childNodes.length;

          if(forCnt != 1) {
            forCnt = forCnt - 2;
          }
          
          return forCnt

        }).then(function(forCnt){
          
          k(driver, forCnt);
          return forCnt;

        }).then(function(forCnt){
          
          if(forCnt != 1) {
            setTimeout(function(){
              k(driver, forCnt);
            }, 1000)
          } // if
        })
      }, 6000)

    } finally {
      // await driver.quit();
      res.render('index');
    }
  })(); // async

}); // route

module.exports = router;
