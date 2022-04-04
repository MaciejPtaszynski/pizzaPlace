import {settings, select} from './settings.js';
import Product from './components/Products.js';
import Cart from './components/Cart.js';
 
const app = {

  initMenu: function(){
    const thisApp = this;
    //console.log('thisApp.data', thisApp.data);
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function(rawResponce){
        return rawResponce.json();
      })
      .then(function(parsedResponse){
        console.log('parsedReponce', parsedResponse);
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
          
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initData();
    // thisApp.initMenu();zmiana 
    thisApp.initCart();
      
  },
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
};
app.init();


