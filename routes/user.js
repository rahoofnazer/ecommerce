var express = require('express');
const { response } = require('../app');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const session = require('express-session');
const { connect } = require('mongodb');

const verifyLogin=(req,res,next)=>{
  console.log("Verify login called")
  if(req.session.user){
    next()
  }else{
    res.redirect('/login') 
  }
}

router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user)
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)

  }
  productHelpers.getAllProducts().then((products)=>{

    res.render('user/view-products',{products,user,cartCount});

  })
});

  
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.userLoginErr} )  }
    req.session.userLoginErr=false
})

router.get('/signup', (req,res)=>{
  res.render('user/signup')
})

router.post('/signup', (req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.user.loggedIn=true
    req.session.user=response

    res.redirect('/')
  })
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.userLoginErr=true
      res.redirect('/login')

      
    }
  })
})

router.get('/logout',verifyLogin,(req,res)=>{

  req.session.user=null 
  res.redirect('/') 
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0 
  if(products.length>0){
   totalValue=await userHelpers.getTotalAmount(req.session.user._id,req.body.user)
  }
  
  
  console.log('userid printed '+req.session.user._id)
  res.render('user/cart',{products,'user':req.session.user,totalValue})
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  console.log('userid printed on change product quantity  '+req.session.user._id)

  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.session.user._id)
    res.json(response)
  })
})
router.get('/place-order',verifyLogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total, 'user' :req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    console.log("109,user.js");
    if(req.body['payment-method']==="cod"){
      res.json({codSuccess:true})
    }else{
      console.log("113,user.js");
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response) 
      }).catch((err)=>{
        console.log("+++++++++++++++++++++++++++++++++++++",err)
      })
    }
  })

  // console.log(req.body,"120,user.js")
})
router.get('/order-placed' ,verifyLogin, async(req,res)=>{
  res.render('user/order-placed', {user:req.session.user})
})
router.get('/orders',verifyLogin, async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log('products printed on view-order-products', products)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  console.log("Verify payment",req.body)

  userHelpers.verifyPayment(req.body).then((response)=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        console.log('Payment successfull')
        res.json({status:true})


      })
      }).catch((err)=>{
        console.log(err)
        res.json({status:false})
      })
  
})
module.exports = router;