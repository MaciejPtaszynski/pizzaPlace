/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  
  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProduct();
      thisProduct.prepareCartProductParams();
    }
    renderInMenu(){
      const thisProduct = this;
      /* generate HTMl based on tamplate */
      const generatedHTML =templates.menuProduct(thisProduct.data);
      // console.log(generatedHTML);
      /* create element using utils.createElementFromHtml */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */ 
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){
      const thisProduct = this;
      
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        event.preventDefault();
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        if (activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }
        thisProduct.element.classList.toggle('active');
        
      });

    }
    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
          
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
      
    }
    processOrder(){
      const thisProduct = this;
      
      const formData = utils.serializeFormToObject(thisProduct.form);
      
      let price = thisProduct.data.price;
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const selectedOption = formData[paramId] && formData[paramId].includes(optionId);
          const selectedImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if(selectedOption) {
            if(!option.default) {
              price += option.price;
            }
          }
          else if(option.default) {
            price -= option.price;
          }
          if(selectedImage){
            if(selectedOption) {
              selectedImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              selectedImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.price = price;
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
      
      
    }
    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProductParams(){
      const thisProduct = this;
      
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        
        params[paramId] = {
          label: param.label,
          options: {}
        };
        
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const selectedOption = formData[paramId] && formData[paramId].includes(optionId);
          if(selectedOption) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.price,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    
    }

    // prepareCartProductParams(){
    //   const thisProduct = this;
      
    //   const formData = utils.serializeFormToObject(thisProduct.form);
    //   const params = {};
    //   for(let paramId in thisProduct.data.params) {
    //     const param = thisProduct.data.params[paramId];
        
    //     params[paramId] = {
    //       label: param.label,
    //       options: {}
    //     };
        
    //     for(let optionId in param.options) {
    //       const option = param.options[optionId];
    //       const selectedOption = formData[paramId] && formData[paramId].includes(optionId);
    //       if(selectedOption) {
    //         params[paramId].options[optionId] = option.label;
    //       }
    //     }
    //   }
    //   return params;
    // }

  
  }
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      
      

      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;  
      }
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    }
    initActions(){
      const thisWidget= this;
      
      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event){
        event.preventDefault ();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event){
        event.preventDefault ();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {bubbles: true});
      thisWidget.element.dispatchEvent(event);
    }
  }

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
  
  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id,
      thisCartProduct.name = menuProduct.name,
      thisCartProduct.amount = menuProduct.amount,
      thisCartProduct.priceSingle = menuProduct.priceSingle,
      thisCartProduct.price = menuProduct.price,
      thisCartProduct.params = menuProduct.params,

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget(); 
      thisCartProduct.initAction();
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element,
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget),
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price),
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit),
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
      
    }
    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('zajebane', this.remove);
    }
    initAction(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove(event);
      });
    }
    getData(){
      const thisCartProduct = this;

      const cartData = {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        params: thisCartProduct.params, 
      };
      return cartData;
    }
  }
  
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
    },
  };
  app.init();
}

