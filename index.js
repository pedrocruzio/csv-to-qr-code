var csv     = require('fast-csv');
var fs      = require('fs');
var request = require('request');
var async   = require('async');

fs.writeFile('errors.txt', '', function(){})

var downloaded = 0;
var totalImages = 0;
var files = [];

csv
 .fromPath("PrometheanProducts.csv")
 .on("data", function(data){
    files.push({product: data[0], url: data[1]})
 })
 .on("end", function(){
    totalImages = files.length;

    async.forEachLimit(files,1,function(file, callback) {
        var productID = file.product;
        var productURL = file.url;

        try {
            writeStream = fs.createWriteStream('./Images/' + productID);

            writeStream.on('open', function(fd) {

                var rem = request.get(productURL);

                rem.on('data', function(chunk) {
                    writeStream.write(chunk);
                });
                rem.on('end', function() {
                    downloaded++;
                    console.log('Downloaded: ' + productID + '; ' + (downloaded) + ' of ' + totalImages);
                    writeStream.end();
                });

            });

            writeStream.on('close', function(){
                callback();
            });

        } catch (err) {
            fs.appendFile('errors.txt', productID + ' failed to download', function (err) {
                callback();
            });
        }

    }, function(err){
        if( err ) {
          console.log(err);
        } else {

        }
    });
});
