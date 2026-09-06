#!/usr/bin/env python3
"""Write the exact opening-shop SKU array, then expand into products.json."""
import json
from pathlib import Path

SOURCE = [
{"code":"104409.484","item":"TSHIRTS MEN","cat":None,"sizes":"S/M/L/XL","qty":12,"price":6.19},
{"code":"104688.200","item":"TSHIRTS MEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":12,"price":5.25},
{"code":"104969.384","item":"TSHIRTS MEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":12,"price":9.4},
{"code":"105098.100","item":"TSHIRTS MEN","cat":None,"sizes":"S/M/L/XL/2XL/3XL","qty":21,"price":13.15},
{"code":"104985.631","item":"TSHIRTS MEN","cat":None,"sizes":"S/M/L/XL","qty":12,"price":9.4},
{"code":"105098.331","item":"TSHIRTS MEN","cat":None,"sizes":"S/M/L/XL/2XL/3XL/4XL","qty":14,"price":13.15},
{"code":"101018.010","item":"TSHIRTS MEN","cat":None,"sizes":"XS/S/M/L/XL","qty":15,"price":7.5},
{"code":"105331.200","item":"TSHIRTS MEN","cat":None,"sizes":"S/M/L/2XL/3XL","qty":10,"price":13.5},
{"code":"903290.200","item":"T-SHIRTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":11.25},
{"code":"902997.384","item":"T-SHIRTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":7.5},
{"code":"903143.576","item":"T-SHIRTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":4.5},
{"code":"902880.200","item":"T-SHIRTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":11.25},
{"code":"903393.278","item":"T-SHIRTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":3.75},
{"code":"903253.251","item":"T-SHIRTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":7.5},
{"code":"902585.547","item":"T-SHIRTS WOMEN","cat":None,"sizes":"L/XL","qty":6,"price":5.77},
{"code":"902547.484","item":"T-SHIRTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":13.95},
{"code":"500949.494","item":"KIDS","cat":None,"sizes":"6/7/8/10/12/14","qty":12,"price":5.25},
{"code":"500948.728","item":"KIDS","cat":None,"sizes":"6/7/8/10/12/14","qty":12,"price":3.0},
{"code":"500963.200","item":"KIDS","cat":None,"sizes":"6/7/8/10/12/14","qty":12,"price":3.75},
{"code":"500966.575","item":"KIDS","cat":None,"sizes":"6/7/8/10/12/14","qty":12,"price":4.5},
{"code":"500947.003","item":"KIDS","cat":None,"sizes":"6/8/10/12/14","qty":10,"price":3.0},
{"code":"500951.594","item":"KIDS","cat":None,"sizes":"6/8/10/12/14","qty":10,"price":3.0},
{"code":"104748.100","item":"SHORTS MEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":7.5},
{"code":"105259.003","item":"SHORTS MEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":11.25},
{"code":"100529.450","item":"SHORTS MEN","cat":None,"sizes":"S/M/L/XL/2XL/3XL","qty":12,"price":8.25},
{"code":"104875.631","item":"SHORTS MEN","cat":None,"sizes":"S/M/L/XL","qty":6,"price":11.25},
{"code":"105037.384","item":"SHORTS MEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":11.25},
{"code":"105358.477","item":"SHORTS MEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":9.4},
{"code":"901138.100","item":"SHORTS WOMEN","cat":None,"sizes":"XS/S/M/L/XL/2XL","qty":12,"price":5.25},
{"code":"902400.346","item":"SHORTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":9.4},
{"code":"903224.343","item":"SHORTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":11.25},
{"code":"903307.272","item":"SHORTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":7.5},
{"code":"903152.272","item":"SHORTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":5.65},
{"code":"902933.384","item":"SHORTS WOMEN","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":7.5},
{"code":"500989.006","item":"SHORTS KIDS","cat":None,"sizes":"6/8/10/12/14","qty":10,"price":3.0},
{"code":"500950.100","item":"SHORTS KIDS","cat":None,"sizes":"6/8/10/12/14","qty":10,"price":4.5},
{"code":"500962.489","item":"SHORTS KIDS","cat":None,"sizes":"6/8/10/12/14","qty":10,"price":4.5},
{"code":"500964.540","item":"SHORTS KIDS","cat":None,"sizes":"6/8/10/12/14","qty":10,"price":3.75},
{"code":"500988.494","item":"SHORTS KIDS","cat":None,"sizes":"6/8/10/12/14","qty":10,"price":3.75},
{"code":"902902.548","item":"TRACKSUITES","cat":None,"sizes":"S/M/L/XL/2XL","qty":5,"price":20.65},
{"code":"903105.703","item":"TRACKSUITES","cat":None,"sizes":"S/M/L/XL/2XL","qty":5,"price":16.9},
{"code":"902516.110","item":"TRACKSUITES","cat":None,"sizes":"XS/S/M/L/XL/2XL","qty":6,"price":19.5},
{"code":"902818.100","item":"LEGGINGS","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":7.5},
{"code":"903028.150","item":"LEGGINGS","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":16.9},
{"code":"101016.700","item":"LEGGINGS","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":9.4},
{"code":"903166.845","item":"LEGGINGS","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":11.25},
{"code":"900684.100","item":"TIGHTS","cat":None,"sizes":"S/M/L/XL/2XL/3XL","qty":12,"price":12.0},
{"code":"101017.100","item":"TIGHTS","cat":None,"sizes":"S/M/L/XL","qty":8,"price":7.5},
{"code":"900760.700","item":"TIGHTS","cat":None,"sizes":"XS/S/M/L/XL","qty":10,"price":7.5},
{"code":"901138280","item":"TIGHTS","cat":None,"sizes":"XS/S/M/L/XL/2XL","qty":12,"price":5.25},
{"code":"AB902377A008","item":"SWEATPANTS","cat":None,"sizes":"S/M/L/XL/2XL","qty":12,"price":20.1},
{"code":"9016P13.35","item":"SWEATPANTS","cat":None,"sizes":"12/14/S/M/L/XL/2XL","qty":14,"price":10.55},
{"code":"106082.845","item":"SWEATPANTS","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":13.15},
{"code":"100761.309","item":"SWEATPANTS","cat":None,"sizes":"XS/S/M/L/XL/2XL","qty":12,"price":9.75},
{"code":"902455.100","item":"SPORT BRA'S","cat":None,"sizes":"S/M/L/XL","qty":8,"price":11.25},
{"code":"901594.322","item":"SPORT BRA'S","cat":None,"sizes":"M/L/XL","qty":6,"price":7.01},
{"code":"902315.685","item":"SPORT BRA'S","cat":None,"sizes":"S/M/L/XL/2XL","qty":10,"price":7.5},
{"code":"902547.009","item":"HOODIES","cat":None,"sizes":"M/L/XL/2XL","qty":4,"price":13.95},
{"code":"903086.006","item":"HOODIES","cat":None,"sizes":"S/M/L/XL/2XL","qty":5,"price":9.4},
{"code":"902157.181","item":"HOODIES","cat":None,"sizes":"S/M/L/XL","qty":4,"price":10.95},
{"code":"903407.278","item":"HOODIES","cat":None,"sizes":"XS/S/M/L/XL/2XL","qty":6,"price":7.5},
{"code":"104233.471","item":"HOODIES","cat":None,"sizes":"S/M/L/XL/2XL/3XL","qty":6,"price":12.0},
{"code":"903408.003","item":"JACKETS","cat":None,"sizes":"XS/S/M/L/XL/2XL","qty":6,"price":9.4},
{"code":"105130.715","item":"JACKETS","cat":None,"sizes":"S/M/L/XL","qty":4,"price":12.38},
{"code":"104442.111","item":"JACKETS","cat":None,"sizes":"XS/S/M/L/XL/2XL/3XL","qty":7,"price":15.0},
{"code":"104295.100","item":"JACKETS","cat":None,"sizes":"XS/S/M/L/XL/2XL/3XL","qty":7,"price":15.0},
{"code":"500961.635","item":"JACKETS","cat":None,"sizes":"6/8/10/12/14","qty":5,"price":9.4},
{"code":"400027.P03","item":"SOCKS","cat":None,"sizes":"35-38","qty":4,"price":17.4},
{"code":"400476.200","item":"SOCKS","cat":None,"sizes":"39-42","qty":4,"price":21.3},
{"code":"400799.600","item":"SOCKS","cat":None,"sizes":"39-42","qty":4,"price":24.0},
{"code":"400435.P01","item":"SOCKS","cat":None,"sizes":"27-29","qty":4,"price":17.4},
{"code":"300151.003","item":"CAPS","cat":None,"sizes":None,"qty":2,"price":112.2},
{"code":"401955.215","item":"FOOTBALLS","cat":None,"sizes":None,"qty":2,"price":99.0},
{"code":"401954.067","item":"FOOTBALLS","cat":None,"sizes":None,"qty":2,"price":112.8},
{"code":"TOJS2604TF","item":"FOOTBALL BOOTS","cat":None,"sizes":"31/32/35/36/37/38","qty":6,"price":10.61},
{"code":"401940.281","item":"SHIN GUARDS","cat":None,"sizes":"S/M/L","qty":9,"price":5.65},
{"code":"401674.106","item":"SHIN GUARDS","cat":None,"sizes":"S/M/L","qty":9,"price":9.35},
{"code":"401676.221","item":"SHIN GUARDS","cat":None,"sizes":"S/M/L","qty":9,"price":8.4},
{"code":"401945.122","item":"GOALKEEPER GLOVES","cat":None,"sizes":"7/8/9/10/11/12","qty":6,"price":11.25},
{"code":"401950.021","item":"GOALKEEPER GLOVES","cat":None,"sizes":"4/5/6/7/8","qty":5,"price":6.45},
{"code":"105106.150","item":"FOOTBALL SETS","cat":None,"sizes":"XS/S/M/L/XL/2XL/3XL","qty":7,"price":16.9},
{"code":"103124.609","item":"FOOTBALL SETS","cat":None,"sizes":"XS/S/M/L/XL/2XL/3XL","qty":7,"price":7.5},
{"code":"401964.600","item":"FOOTBALL SETS","cat":None,"sizes":"35-38","qty":4,"price":12.0},
{"code":"401717.102","item":"FOOTBALL SETS","cat":None,"sizes":"35-38","qty":4,"price":15.0},
{"code":"400228.702","item":"FOOTBALL SETS","cat":None,"sizes":"S/M/L","qty":6,"price":14.8},
{"code":"400392.450","item":"FOOTBALL SETS","cat":None,"sizes":"L","qty":4,"price":12.0},
{"code":"400378.702","item":"FOOTBALL SETS","cat":None,"sizes":"L","qty":4,"price":12.0},
{"code":"100050.300","item":"FOOTBALL SETS","cat":None,"sizes":"S/M/L/XL/2XL/3XL/4XL","qty":21,"price":7.5},
{"code":"102699.100","item":"FOOTBALL SETS","cat":None,"sizes":"S/M/L/XL/2XL","qty":15,"price":7.05},
{"code":"101660.331","item":"FOOTBALL SETS","cat":None,"sizes":"2XS/XS/S/M/L/XL/2XL/3XL/4XL/5XL","qty":30,"price":4.5},
{"code":"903347.907","item":"FOOTBALL SETS","cat":None,"sizes":"XS/S/M/L/XL/2XL","qty":12,"price":7.55},
{"code":"105332.450","item":"FOOTBALL SETS","cat":None,"sizes":"S/M/L/XL/2XL/3XL/4XL","qty":21,"price":9.4},
{"code":"ACUS2601AG","item":"FOOTBALL SETS","cat":None,"sizes":"39/40/41/42/43/44/45","qty":7,"price":22.35},
{"code":"ACUS2732FG","item":"FOOTBALL SETS","cat":None,"sizes":"39/40/41/42/43/44/45/46","qty":8,"price":22.03},
{"code":"GOLCS2709FG","item":"FOOTBALL SETS","cat":None,"sizes":"37/38/39/40/41/42/43/44/45/46","qty":10,"price":53.98},
{"code":"GOLS2622TFV","item":"FOOTBALL SETS","cat":None,"sizes":"32/33.5/35.5/36.5","qty":4,"price":11.72},
{"code":"TOJW2606AG","item":"FOOTBALL SETS","cat":None,"sizes":"32/33/34/35/36/37/38/39","qty":8,"price":137.28},
{"code":"BKBUZZW2504","item":"BASKETBALL SHOES","cat":"BASKETBALL","sizes":"40/41/42/43/44/45/46/47/48","qty":9,"price":31.0},
{"code":"BKLITW2501","item":"BASKETBALL SHOES","cat":"BASKETBALL","sizes":"40/41/42/43/44/45/46/47/48","qty":9,"price":37.69},
{"code":"100529.603","item":"BASKETBALL SHORTS","cat":"BASKETBALL","sizes":"XXS/XS/M/L/XL/2XL/3XL","qty":7,"price":8.25},
{"code":"104526.100","item":"BASKETBALL SHORTS","cat":"BASKETBALL","sizes":"XXS/XS/M/L/XL/2XL/3XL","qty":7,"price":5.25},
{"code":"100050.603","item":"JERSEYS","cat":"BASKETBALL","sizes":"XXS/XS/S/M/L/XL/2XL/3XL","qty":8,"price":7.55},
{"code":"100052.700","item":"JERSEYS","cat":"BASKETBALL","sizes":"XXS/XS/S/M/L/XL/2XL/3XL","qty":8,"price":4.5},
{"code":"104371.602","item":"SETS","cat":"BASKETBALL","sizes":"XXS/XS/S/M/L/XL/2XL/3XL/4XL","qty":9,"price":18.75},
{"code":"104287.063","item":"SETS","cat":"BASKETBALL","sizes":"XXS/XS/S/M/L/XL/2XL/3XL/4XL","qty":9,"price":9.75},
{"code":"102851.881","item":"SETS","cat":"BASKETBALL","sizes":"XXS/XS/S/M/L/XL/2XL/3XL","qty":8,"price":17.25},
{"code":"903233.728","item":"DRESSES","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":5,"price":16.9},
{"code":"902900.250","item":"DRESSES","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":5,"price":16.15},
{"code":"903275.760","item":"DRESSES","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":5,"price":15.0},
{"code":"903286.200","item":"DRESSES","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":5,"price":18.75},
{"code":"PICKLW2602","item":"SHOES","cat":"NETBALL","sizes":"36/37/38/39/40/41","qty":6,"price":38.2},
{"code":"PSWILS2602","item":"SHOES","cat":"NETBALL","sizes":"34/35/36/37/38/39/40/41","qty":8,"price":21.32},
{"code":"900759.738","item":"SKIRTS","cat":"NETBALL","sizes":"XXS/XS/S/M/L/XL","qty":6,"price":10.5},
{"code":"902932.631","item":"SKIRTS","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":5,"price":11.25},
{"code":"902879.200","item":"SKIRTS","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":5,"price":11.25},
{"code":"104399.100","item":"SWIMWEAR","cat":"NETBALL","sizes":"XXS/XS/S/M/L/XL","qty":6,"price":9.0},
{"code":"104141.582","item":"SWIMWEAR","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":5,"price":10.95},
{"code":"103843.700","item":"SWIMWEAR","cat":"NETBALL","sizes":"S/M/L/XL","qty":4,"price":10.15},
{"code":"104148.745","item":"SWIMWEAR","cat":"NETBALL","sizes":"S/M/L/XL","qty":4,"price":19.95},
{"code":"902448.583","item":"SWIMWEAR","cat":"NETBALL","sizes":"S/M/L/XL","qty":4,"price":24.95},
{"code":"902268.600","item":"SWIMWEAR","cat":"NETBALL","sizes":"S/M/L/XL","qty":4,"price":13.5},
{"code":"902567.100","item":"SWIMWEAR","cat":"NETBALL","sizes":"S/M/L/XL","qty":4,"price":16.5},
{"code":"902447.100","item":"SWIMWEAR","cat":"NETBALL","sizes":"S/M/L/XL","qty":4,"price":34.95},
{"code":"300022.001","item":"CAPS","cat":"NETBALL","sizes":"SR","qty":3,"price":31.1},
{"code":"401091.700","item":"GOOGELS","cat":"NETBALL","sizes":"SR","qty":10,"price":7.5},
{"code":"400680.217","item":"RUGBY BALLS","cat":"NETBALL","sizes":"T4","qty":3,"price":9.0},
{"code":"400742.201","item":"RUGBY BALLS","cat":"NETBALL","sizes":"T5","qty":5,"price":9.0},
{"code":"400679.206","item":"RUGBY BALLS","cat":"NETBALL","sizes":"T5","qty":5,"price":11.25},
{"code":"105370.353","item":"RUGBY JERSEYS","cat":"NETBALL","sizes":"S/M/L/XL/2XL/3XL/4XL/5XL","qty":16,"price":26.25},
{"code":"102219.602","item":"RUGBY JERSEYS","cat":"NETBALL","sizes":"S/M/L/XL/2XL/3XL/4XL/5XL","qty":16,"price":12.2},
{"code":"103839.450","item":"RUGBY JERSEYS","cat":"NETBALL","sizes":"S/M/L/XL/2XL/3XL/4XL","qty":14,"price":9.0},
{"code":"102220.200","item":"RUGBY SHORTS","cat":"NETBALL","sizes":"XS/S/M/L/XL/2XL/3XL/4XL/5XL","qty":18,"price":10.5},
{"code":"102220.100","item":"RUGBY SHORTS","cat":"NETBALL","sizes":"XS/S/M/L/XL/2XL/3XL/4XL/5XL","qty":18,"price":10.5},
{"code":"SW91202D0102","item":"RUGBY SHORTS","cat":"NETBALL","sizes":"S/M/L/XL/2XL","qty":10,"price":15.0},
{"code":"400438.100","item":"SCRUM CAPS","cat":"NETBALL","sizes":"XS/M/L","qty":6,"price":10.15},
{"code":"400704.106","item":"SCRUM CAPS","cat":"NETBALL","sizes":"M/L","qty":6,"price":9.6},
{"code":"101339.100","item":"SHOULDER PROTECTION","cat":"NETBALL","sizes":"L/XL","qty":4,"price":22.3},
{"code":"104443.001","item":"CRICKET CLOTHING","cat":"NETBALL","sizes":"XS/S/M/L/XL/2XL/3XL","qty":14,"price":11.65},
{"code":"104444.001","item":"CRICKET CLOTHING","cat":"NETBALL","sizes":"XS/S/M/L/XL/2XL/3XL","qty":14,"price":13.15},
{"code":"1044445.001","item":"CRICKET CLOTHING","cat":"NETBALL","sizes":"XS/S/M/L/XL/2XL/3XL","qty":14,"price":12.0},
{"code":"104446.001","item":"CRICKET CLOTHING","cat":"NETBALL","sizes":"XS/S/M/L/XL/2XL/3XL","qty":14,"price":13.5},
{"code":"104447.001","item":"CRICKET CLOTHING","cat":"NETBALL","sizes":"XS/S/M/L/XL/2XL/3XL","qty":14,"price":15.0},
{"code":"700147.100","item":"BOXING SHORTS","cat":"BOXING","sizes":"S/M/L/XL","qty":4,"price":10.31},
{"code":"900250.100","item":"SHORTS","cat":"HOCKEY","sizes":"XS/S/M/L/XL/2XL","qty":12,"price":5.25},
{"code":"RR110S2502","item":"TRAINING SHOES","cat":"HOCKEY","sizes":"37/38/40/41/42/44.5","qty":6,"price":78.4},
{"code":"RSKYFW2209","item":"TRAINING SHOES","cat":"HOCKEY","sizes":"36/38/40/41/42/43/44/45","qty":8,"price":27.18},
{"code":"AA11202B0102","item":"RUNNING SHORTS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":19.91},
{"code":"101353.276","item":"RUNNING SHORTS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":13.9},
{"code":"903307.594","item":"RUNNING SHORTS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":7.5},
{"code":"105268.100","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":7.5},
{"code":"105342.585","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":13.15},
{"code":"903259.429","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":11.25},
{"code":"903264.175","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":9.4},
{"code":"903269.100","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":15.0},
{"code":"903225.100","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":13.15},
{"code":"902648.100","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":11.25},
{"code":"903302.685","item":"RUNNING TOPS","cat":"HOCKEY","sizes":"S/M/L/XL/2XL","qty":5,"price":11.25},
{"code":"401535.008","item":"YOGA/EXERCISE MATS","cat":"HOCKEY","sizes":"ONE SIZE","qty":3,"price":9.86},
{"code":"401535.100","item":"YOGA/EXERCISE MATS","cat":"HOCKEY","sizes":"ONE SIZE","qty":3,"price":9.86},
{"code":"400921.353","item":"TOWELS","cat":"HOCKEY","sizes":"ONE SIZE","qty":10,"price":11.25},
{"code":"RR300W2680","item":"SHOES","cat":"SHOES","sizes":"36/37/38/39/40/42","qty":6,"price":74.5},
{"code":"TOPW2621IN","item":"SHOES","cat":"SHOES","sizes":"35/36/37/38/39/40/41/42/43/44/45/46/47","qty":13,"price":26.33},
{"code":"RR300S2702","item":"SHOES","cat":"SHOES","sizes":"36/37/38/39/41","qty":5,"price":68.73},
{"code":"RR600W2691","item":"SHOES","cat":"SHOES","sizes":"37/38/39/40/41/42/43/44/45/46","qty":10,"price":45.3},
{"code":"FOR20S2727","item":"SHOES","cat":"SHOES","sizes":"39/40/41/42/43/44/45/46/47","qty":9,"price":53.56},
{"code":"RFENIS2701","item":"SHOES","cat":"SHOES","sizes":"39/40/41/42/43/44/45/46","qty":8,"price":30.64},
{"code":"RVICT2703","item":"SHOES","cat":"SHOES","sizes":"39/40/41/42/43/44/45/46","qty":8,"price":23.71},
{"code":"RVIPLS2729","item":"SHOES","cat":"SHOES","sizes":"36/37/38/39/40/41","qty":6,"price":32.01},
{"code":"RMETL2703","item":"SHOES","cat":"SHOES","sizes":"36/37/38/39/40/41","qty":6,"price":115.2},
{"code":"C448S2715","item":"SHOES","cat":"SHOES","sizes":"40/41/42/43/44/45/46","qty":7,"price":147.04},
{"code":"CCLAS2702","item":"SHOES","cat":"SHOES","sizes":"36/37/38/39/40/41/42/43/44","qty":9,"price":12.87},
{"code":"JFERRS2703V","item":"SHOES","cat":"SHOES","sizes":"27/28/29/30/31/32/33/34/35/36/37/38/39","qty":13,"price":10.98},
{"code":"JBFNVS2713","item":"SHOES","cat":"SHOES","sizes":"22/23/24/25/26","qty":5,"price":95.9},
{"code":"JLYNXS2706","item":"SHOES","cat":"SHOES","sizes":"36/37/38/39","qty":4,"price":112.7},
{"code":"SPLAYS2701","item":"SHOES","cat":"SHOES","sizes":"39/40/41/42/43/44/45/46","qty":8,"price":6.23},
{"code":"SYAILS2702","item":"SHOES","cat":"SHOES","sizes":"36/37/38/39/40/41","qty":6,"price":80.16},
{"code":"400751.907","item":"VOLLEYBALL","cat":"BALLS","sizes":"T5","qty":3,"price":20.65},
{"code":"400198.100","item":"EQUIPMENT BAGS","cat":"BAGS","sizes":"S","qty":2,"price":33.75},
{"code":"400480.100","item":"EQUIPMENT BAGS","cat":"BAGS","sizes":"S","qty":2,"price":37.5},
{"code":"400631.100","item":"BAGS","cat":"BAGS","sizes":"ONE SIZE","qty":2,"price":10.5},
{"code":"401027.100","item":"BAGS","cat":"BAGS","sizes":"ONE SIZE","qty":2,"price":9.5},
{"code":"400234.106","item":"BAGS","cat":"BAGS","sizes":"S","qty":2,"price":9.0},
{"code":"A141905D3101","item":"BAGS","cat":"BAGS","sizes":"ONE SIZE","qty":2,"price":6.75},
{"code":"TEAM/14","item":"BALLS BAGS","cat":"BAGS","sizes":"S","qty":2,"price":12.75},
]

SUB_SLUG = {
    "TSHIRTS MEN": ("tees-men", "men"),
    "T-SHIRTS WOMEN": ("tees-women", "women"),
    "KIDS": ("tees-kids", "kids"),
    "SHORTS MEN": ("shorts", "men"),
    "SHORTS WOMEN": ("shorts", "women"),
    "SHORTS KIDS": ("shorts", "kids"),
    "TRACKSUITES": ("tracksuits", "unisex"),
    "LEGGINGS": ("leggings", "women"),
    "TIGHTS": ("tights", "unisex"),
    "SWEATPANTS": ("sweatpants", "unisex"),
    "SPORT BRA'S": ("bras", "women"),
    "HOODIES": ("hoodies", "unisex"),
    "JACKETS": ("jackets", "unisex"),
    "SOCKS": ("socks", "unisex"),
    "CAPS": ("caps", "unisex"),
    "FOOTBALLS": ("balls", "unisex"),
    "FOOTBALL BOOTS": ("boots", "unisex"),
    "SHIN GUARDS": ("shin-guards", "unisex"),
    "GOALKEEPER GLOVES": ("gk-gloves", "unisex"),
    "FOOTBALL SETS": ("sets", "unisex"),
    "BASKETBALL SHOES": ("shoes", "unisex"),
    "BASKETBALL SHORTS": ("shorts", "unisex"),
    "JERSEYS": ("jerseys", "unisex"),
    "SETS": ("sets", "unisex"),
    "DRESSES": ("dresses", "women"),
    "SHOES": ("shoes", "unisex"),
    "SKIRTS": ("skirts", "women"),
    "SWIMWEAR": ("swimwear", "unisex"),
    "GOOGELS": ("goggles", "unisex"),
    "RUGBY BALLS": ("balls", "unisex"),
    "RUGBY JERSEYS": ("jerseys", "unisex"),
    "RUGBY SHORTS": ("shorts", "unisex"),
    "SCRUM CAPS": ("scrum-caps", "unisex"),
    "SHOULDER PROTECTION": ("protection", "unisex"),
    "CRICKET CLOTHING": ("clothing", "unisex"),
    "BOXING SHORTS": ("shorts", "unisex"),
    "SHORTS": ("shorts", "unisex"),
    "TRAINING SHOES": ("training-shoes", "unisex"),
    "RUNNING SHORTS": ("shorts", "unisex"),
    "RUNNING TOPS": ("tops", "unisex"),
    "YOGA/EXERCISE MATS": ("mats", "unisex"),
    "TOWELS": ("towels", "unisex"),
    "VOLLEYBALL": ("balls", "unisex"),
    "EQUIPMENT BAGS": ("equipment-bags", "unisex"),
    "BAGS": ("bags", "unisex"),
    "BALLS BAGS": ("ball-bags", "unisex"),
}

TITLES = {
    "TSHIRTS MEN": "T-Shirts Men",
    "T-SHIRTS WOMEN": "T-Shirts Women",
    "KIDS": "Kids Tee",
    "SHORTS MEN": "Shorts Men",
    "SHORTS WOMEN": "Shorts Women",
    "SHORTS KIDS": "Shorts Kids",
    "TRACKSUITES": "Tracksuit",
    "LEGGINGS": "Leggings",
    "TIGHTS": "Tights",
    "SWEATPANTS": "Sweatpants",
    "SPORT BRA'S": "Sports Bra",
    "HOODIES": "Hoodie",
    "JACKETS": "Jacket",
    "SOCKS": "Socks",
    "CAPS": "Cap",
    "FOOTBALLS": "Football",
    "FOOTBALL BOOTS": "Football Boots",
    "SHIN GUARDS": "Shin Guards",
    "GOALKEEPER GLOVES": "Goalkeeper Gloves",
    "FOOTBALL SETS": "Football Set",
    "BASKETBALL SHOES": "Basketball Shoes",
    "BASKETBALL SHORTS": "Basketball Shorts",
    "JERSEYS": "Jersey",
    "SETS": "Set",
    "DRESSES": "Netball Dress",
    "SHOES": "Shoes",
    "SKIRTS": "Skirt",
    "SWIMWEAR": "Swimwear",
    "GOOGELS": "Swim Goggles",
    "RUGBY BALLS": "Rugby Ball",
    "RUGBY JERSEYS": "Rugby Jersey",
    "RUGBY SHORTS": "Rugby Shorts",
    "SCRUM CAPS": "Scrum Cap",
    "SHOULDER PROTECTION": "Shoulder Protection",
    "CRICKET CLOTHING": "Cricket Clothing",
    "BOXING SHORTS": "Boxing Shorts",
    "SHORTS": "Hockey Shorts",
    "TRAINING SHOES": "Training Shoes",
    "RUNNING SHORTS": "Running Shorts",
    "RUNNING TOPS": "Running Top",
    "YOGA/EXERCISE MATS": "Yoga / Exercise Mat",
    "TOWELS": "Training Towel",
    "VOLLEYBALL": "Volleyball",
    "EQUIPMENT BAGS": "Equipment Bag",
    "BAGS": "Bag",
    "BALLS BAGS": "Ball Bag",
}


def map_category(item: str, cat, _code: str) -> str:
    """Map a sheet row to a storefront category slug.

    cat=null apparel → Sportswear, except FOOTBALL*/SOCKS/SHIN*/GOALKEEPER* → Football.
    Mislabeled sheet cats: SWIMWEAR/CAPS/GOOGELS → Swimming; RUGBY* → Rugby;
    CRICKET* → Cricket; clearly-shoe codes (SHOES cat + TRAINING SHOES) → Shoes;
    volleyball/bags/paddle balls → Balls & Bags.
    """
    i = item.upper()
    c = (cat or "").upper()
    if i in {"SWIMWEAR", "GOOGELS"} or (i == "CAPS" and c == "NETBALL"):
        return "swimming"
    if i.startswith("RUGBY") or i in {"SCRUM CAPS", "SHOULDER PROTECTION"}:
        return "rugby"
    if "CRICKET" in i:
        return "cricket"
    if c in {"BALLS", "BAGS"} or "BAG" in i or i == "VOLLEYBALL" or "PADDEL" in i:
        return "balls-bags"
    # Netball court shoes stay in Netball; hockey-filed TRAINING SHOES and SHOES-cat rows go to Shoes.
    if i == "SHOES" and c == "NETBALL":
        return "netball"
    if c == "SHOES" or i == "TRAINING SHOES":
        return "shoes"
    if i.startswith("RUNNING") or "YOGA" in i or i == "TOWELS":
        return "running-fitness"
    if c == "BASKETBALL" or "BASKETBALL" in i:
        return "basketball"
    if c == "BOXING" or "BOXING" in i:
        return "boxing"
    if c == "HOCKEY" and i == "SHORTS":
        return "hockey"
    if c == "NETBALL" and i in {"DRESSES", "SKIRTS", "SHOES"}:
        return "netball"
    if (
        i.startswith("FOOTBALL")
        or i == "SOCKS"
        or i.startswith("SHIN")
        or "SHIN" in i
        or i.startswith("GOALKEEPER")
        or "GOALKEEPER" in i
    ):
        return "football"
    return "sportswear"


def parse_sizes(raw):
    if not raw:
        return ["ONE"]
    parts = [p.strip() for p in str(raw).split("/") if p.strip()]
    return parts or ["ONE"]


def split_stock(sizes, qty):
    n = max(len(sizes), 1)
    qty = int(qty or 0)
    base, rem = divmod(qty, n)
    out = []
    for i, size in enumerate(sizes):
        stock = base + (1 if i < rem else 0)
        out.append({"size": size, "stock": stock})
    return out


def main():
    root = Path(__file__).resolve().parents[1]
    data = root / "data"
    data.mkdir(exist_ok=True)
    (data / "products-source.json").write_text(json.dumps(SOURCE, indent=2) + "\n")
    assert len(SOURCE) == 184, len(SOURCE)
    codes = [r["code"] for r in SOURCE]
    assert len(codes) == len(set(codes)), "duplicate codes"

    products = []
    for i, row in enumerate(SOURCE):
        item = row["item"]
        cat = map_category(item, row.get("cat"), row["code"])  # code kept for signature / future overrides
        sub, gender = SUB_SLUG.get(item, ("general", "unisex"))
        if item == "JACKETS" and str(row.get("sizes", "")).startswith("6/"):
            gender = "kids"
            sub = "jackets-kids"
        if item == "CAPS" and cat == "swimming":
            sub = "caps"
        if item == "SHORTS" and cat == "hockey":
            sub = "shorts"
            gender = "unisex"
        if item == "TRAINING SHOES":
            sub = "training-shoes"
        sizes = parse_sizes(row.get("sizes"))
        stock = split_stock(sizes, row["qty"])
        title_base = TITLES.get(item, item.title())
        price = float(str(row["price"]).replace(" ", ""))
        qty = int(row["qty"] or 0)
        badge = None
        if i % 17 == 0:
            badge = "new"
        if price <= 4.5 and qty >= 8:
            badge = "offer"
        sku_id = row["code"].replace(".", "-").replace("/", "-")
        image_dir = root / "public" / "products" / sku_id
        shots = []
        if image_dir.is_dir():
            for name in ("01.webp", "02.webp", "03.webp", "04.webp", "05.webp",
                         "01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg"):
                if (image_dir / name).is_file():
                    shots.append(f"/products/{sku_id}/{name}")
            # keep 01..05 order, unique
            ordered = []
            for n in range(1, 6):
                match = next((s for s in shots if s.rsplit("/", 1)[-1].startswith(f"{n:02d}.")), None)
                if match and match not in ordered:
                    ordered.append(match)
            shots = ordered
        products.append(
            {
                "id": sku_id,
                "code": row["code"],
                "item": item,
                "title": f"{item} · {row['code']}",
                "name": f"{item} · {row['code']}",
                "displayName": title_base,
                "category": cat,
                "subcategory": sub,
                "gender": gender,
                "price": price,
                "unitPrice": price,
                "currency": "NAD",
                "sheetCategory": row.get("cat"),
                "totalQty": qty,
                "stockQty": qty,
                "badge": badge,
                "sizeOptions": sizes,
                "sizes": stock,
                "imageUrl": shots[0] if shots else "",
                "images": shots,
            }
        )

    (data / "products.json").write_text(json.dumps(products, indent=2) + "\n")
    from collections import Counter
    counts = Counter(p["category"] for p in products)
    print("SKU", len(products))
    for k, v in sorted(counts.items()):
        print(f"  {k}: {v}")
    expected = {
        "sportswear": 68,
        "football": 29,
        "basketball": 9,
        "netball": 9,
        "swimming": 10,
        "rugby": 12,
        "cricket": 5,
        "boxing": 1,
        "hockey": 1,
        "running-fitness": 14,
        "shoes": 18,
        "balls-bags": 8,
    }
    assert dict(counts) == expected, (dict(counts), expected)
    cats = [
        {"slug": k, "name": k.replace("-", " ").title(), "count": expected[k]}
        for k in expected
    ]
    (data / "categories.json").write_text(json.dumps(cats, indent=2) + "\n")


if __name__ == "__main__":
    main()
