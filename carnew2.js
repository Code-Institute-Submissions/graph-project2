queue()
    .defer(d3.csv, "data/norway_new_car.csv")
    .await(makeGraphs);


function makeGraphs(error, carsData) {
  var ndx = crossfilter(carsData);     
  
  carsData.forEach(function(d){ 
      d.cars=parseInt(d.cars);
  });

show_make_selector(ndx);
show_quantity_sold(ndx);   
show_average_percentage(ndx); 
show_year_distrubtion(ndx); 

} 
 function show_make_selector(ndx){
dim=ndx.dimension(dc.pluck("Make")); 
 group=dim.group(); 
 
 dc.selectMenu("#make_selector") 
   .dimension(dim) 
   .group(group);


function show_percent_that_are_professors(ndx, Quantity, element) {
    var percentageThatAreProf = ndx.groupAll().reduce(
        function (p, v) {
            if (v.amount === Quantity) {
                p.count++;
                if (v.make === "Make") {
                   p.are_p++;
                }
            }
            return p;
        },
        function (p, v) {
            if (v.sex === gender) {
                p.count--;
                if (v.rank === "Prof") {
                   p.are_prof--;
                }
            }
            return p;
        },
        function () {
            return {count: 0, are_prof: 0};
        }
    );

    dc.numberDisplay(element)
        .formatNumber(d3.format(".2%"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.are_prof / d.count);
            }
        })
        .group(percentageThatAreProf);