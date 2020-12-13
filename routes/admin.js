const { response } = require('express');
var express = require('express');
const { reset } = require('nodemon');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const session = require('express-session');
var adminHelpers=require('../helpers/admin-helpers');

const verifyAdmin=(req,res,next)=>{
  console.log("Verify Admin called")
  if (req.session.admin){
    next()
  }else{
    res.redirect('/')
  }
}

router.get('/',(req,res)=>{
res.render('admin/login')
})

// signup in login form method

// router.post('/Login',(req,res)=>{
// adminHelpers.doSignup(req.body).then((response)=>{
//   console.log(response)
//   res.redirect('/admin/viewProducts')
//   })
// })

router.post('/Login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      res.redirect('/admin/viewProducts')
    }else{
      res.redirect('/admin')
    }
  })
})


router.get('/viewProducts', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{

    console.log(products);
    res.render('admin/view-products',{admin:true,products});

  })
})

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
router.get('/delete-product/:id',(req,res)=>{
    let proId=req.params.id
    console.log(proId);
     productHelpers.deleteProduct(proId).then((response)=>{
       res.redirect('/admin/')
     })
    
})

router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{

  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if (req.files.image){
      let image=req.files.image
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
})
module.exports = router;
