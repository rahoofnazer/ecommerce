var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res, next) {

  let products=[
    {
      name: "iPhone 5",
      category: "Mobile",
      description: "This is a nice phone by apple",
      image:"https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-5-front.jpg"
    },

    {
      name: "iPhone 6s",
      category: "Mobile",
      description: "This is a good looking nice new phone by apple",
      image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcToQObNUv9DepumIKOuVcRQCi5igWYuFyHEjPfew-ZBEfDt6jg68PRYQe88WDl-fawF92zf03w&usqp=CAc"
    },

    {
      name: "iPhone X",
      category: "Mobile",
      description: "New Iphone Era by apple is here",
      image:"data:image/jpeg;base64,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"
    },

    {
      name: "iPhone 12 Pro",
      category: "Mobile",
      description: "Her is the fastest Iphone ever ",
      image:"data:image/jpeg;base64,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"
    }

  ]

  res.render('admin/view-products',{admin:true,products});
});
router.get('/add-product',function(req,res){
  res.render('admin/add-product')
})
router.post('/add-product',(req,res)=>{
  console.log(req.body)
  console.log(req.files.image)

  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }else{
        console.log(err);
      }
    })
   
  })
})


module.exports = router;
