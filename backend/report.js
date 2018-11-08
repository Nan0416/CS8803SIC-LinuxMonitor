function join(){
    var options = {
        hostname: 'www.postcatcher.in',
          port: 80,
          path: '/catchers/5531b7faacde130300002495',
          method: 'POST',
          headers: {
                  'Content-Type': 'application/json',
              }
            };
    var req = http.request(options, function(res) {
      console.log('Status: ' + res.statusCode);
      console.log('Headers: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (body) {
        console.log('Body: ' + body);
        fs.writeFile("test.txt", body, function(err) {
        if(err) {
            return console.log(err);
        }
                  console.log("The file was saved!");
        }); 
      });
    });
}
function leave(){

}