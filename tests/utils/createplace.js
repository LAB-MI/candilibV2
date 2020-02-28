var now = new Date()
var cursorCentre = db.getCollection("centres").find({ departement: '75', nom: 'Rosny sous bois'})
// cursorCentre.toArray()[0]
var idcentre = cursorCentre.toArray()[0]._id;
var newPlaces = [];
var dates = [-8,-7,-6].map( iday => [ 8, 9, 10, 11, 14, 15].map(hour =>  new Date(now.getFullYear(), now.getMonth(), now.getDate() +iday, hour))).reduce((acc, val) => acc.concat(val), []);

var cursorIpcsr = db.getCollection("inspecteurs").find({departement: '75'},{ _id : 1})
var ipcsr = cursorIpcsr.toArray().map(({ _id }) => _id)

for(let indexb = 0; indexb < 5; indexb++ ){
    for (let index = 0; index < dates.length; index++) {
       newPlaces.push({
        "inspecteur" : ipcsr[indexb],
        "date" : dates[index],
        "centre" : idcentre,
       })
    }
}
db.getCollection("places").insertMany(newPlaces)

