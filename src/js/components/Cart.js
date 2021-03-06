import {settings, select, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
      
  }

  getElements(element){
    const thisCart = this;
      
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
      
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee),
    thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice),
    thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice),
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle('active');
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;
      
    const generatedHTML = templates.cartProduct(menuProduct);
    
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      
    thisCart.dom.productList.appendChild(generatedDOM);
    //console.log('koszyk', menuProduct);
      
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart produkty',thisCart.products);

    thisCart.update();
  }
  update(){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let cartProduct of thisCart.products){
      thisCart.totalNumber = cartProduct.amount + thisCart.totalNumber;
      thisCart.subtotalPrice = cartProduct.price + thisCart.subtotalPrice;

    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    if(thisCart.totalNumber === 0){
      thisCart.totalPrice = 0;
      thisCart.subtotalPrice = 0;
      thisCart.deliveryFee = 0;
    } else{
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    }
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

    for(let totalPrices of thisCart.dom.totalPrice){
      totalPrices.innerHTML = thisCart.totalPrice;
    }
  }
  remove(cartProduct){
    const thisCart = this;

    const indexOfCartProduct = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indexOfCartProduct, 1);
    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      //address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      address: thisCart.dom.address.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    console.log(payload);
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
      
  }
}

export default Cart;