
db.getCollection('centres')
  .find({})
  .forEach(function (centre) {
    const zipCode = centre.adresse && centre.adresse.match(/([0-9AB]{2})[0-9]{3}/)
    printjson(centre.adresse)
    printjson(zipCode)
    const dep = (zipCode && zipCode.length > 1 && zipCode[1]) || centre.departement
    printjson(dep)
    db.getCollection('centres').update({ _id: centre._id }, { $set: { geoDepartement: dep } })
  })
