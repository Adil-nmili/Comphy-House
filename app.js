// collecting our variables
const panieIcone =  document.querySelector('.panie-icon');
const itemsNumbers =document.querySelector('.number-icons');
const productCenter = document.querySelector('.product-center');
const product = document.querySelector('.product');
const cardOverlay = document.querySelector('.card-overly');
const btnsDom = document.querySelector('.addtocard')
const card = document.querySelector('.card');
const closeButton = document.querySelector('.third-burger');
// const cardItems = document.querySelector('.card-item');
const cardContent = document.querySelector('.card-content');
const clearCard = document.querySelector('.clear-item');
const totalAmount = document.querySelector('.total-amount');
const myHeader = document.querySelector('.hero');






let cart = [];
// my buttons
let buttonsDom = [];
// getting the products
class Products{
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

//display products
class UI{
    displayProducts(products) {
        let result = '';
        products.forEach(produc => {
            result += `
                <div class="product">
                <div class="image-container">
                    <img src=${produc.image} alt="" class="image-pro">
                    <button class="addtocard" data-id=${produc.id}>
                        <div class="second-burger">
                            <span class="material-symbols-outlined">
                                add_shopping_cart
                            </span>
                        </div>
                        Add to bag
                    </button>
                </div>
                <h3>${produc.title}</h3>
                <h4>$ ${produc.price}</h4>
            </div>
            `
        });
        productCenter.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.addtocard')];
        buttonsDom = buttons;
        buttons.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                btn.innerText = 'In Cart';
                btn.disabled = true;
            }
            
            btn.addEventListener('click', (event) => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;
                //grt product from products
                let cartItem = {...Storage.getProduct(id), amount:1}
                // add the product to the cart
                cart = [...cart, cartItem]
                // seve cart in local storage
                Storage.saveCart(cart);
                // set  cart values
                this.setCartValues(cart)
                // display cart item
                this.displayItem(cartItem)
                // show cart
                this.showCart()
            })
            
        })
    }
    setCartValues(cart) {
        let tempTotal =0;
        let itemTotal = 0 ;
        cart.map (item => {
            tempTotal += item.price * item.amount;
            itemTotal += item.amount;
        })
        totalAmount.innerText = parseFloat(tempTotal.toFixed(2))
        itemsNumbers.innerText = itemTotal;
    }
    displayItem(item) {
        const div = document.createElement('div')
        div.classList.add('card-item');
        div.innerHTML = `<img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$ ${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <span class="material-symbols-outlined up-arrow" data-id=${item.id}>
                            expand_less
                        </span>
                        <p class="item-amount">${item.amount}</p>
                        <span class="material-symbols-outlined down-arrow" data-id=${item.id}>
                            expand_more
                        </span>
                    </div>`;
        cardContent.appendChild(div);
    }
    showCart() {
        card.classList.add('show')
        cardOverlay.classList.add('visible')
    }
    setAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        panieIcone.addEventListener('click', this.showCart)
        closeButton.addEventListener('click', this.hideCart)
    }

    populateCart(cart) {
        cart.forEach(item => {
            this.displayItem(item)
        });
    }
    hideCart() {
        card.classList.remove('show')
        cardOverlay.classList.remove('visible')
    }
    cartLogic() {
        // clear cart button
        clearCard.addEventListener('click', () => {
            this.clearcart()
        })
        // cart fonctionality
        cardContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cardContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItems(id)
            }
            else if (event.target.classList.contains('up-arrow')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id ===id);
                tempItem.amount = tempItem.amount +1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

            } 
            else if(event.target.classList.contains('down-arrow')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount -1;
                if(tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText= tempItem.amount;
                }
                else {
                    cardContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItems(id)
                }
            }
        })
    }
    clearcart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItems(id))
        while(cardContent.children.length > 0) {
            cardContent.removeChild(cardContent.children[0])
        }
        this.hideCart()
    }
    removeItems(id) {
        cart = cart.filter(item => item.id !==id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleBtn(id)
        button.disabled = false;
        button.innerText = `Add to bag`
    }
    getSingleBtn(id) {
        return buttonsDom.find(button => button.dataset.id === id)
    }
}

//local storage
class Storage{
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart () {
        return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')): []
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    // setup the cart
    ui.setAPP();
    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() =>{
        ui.getBagButtons();
        ui.cartLogic();
    })
})