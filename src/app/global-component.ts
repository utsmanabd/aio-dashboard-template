export const GlobalComponent = {
    // Api Calling
    API_URL : 'http://localhost:3000/api/',
    headerToken : {'Authorization': `${localStorage.getItem('token')}`},

    // Auth Api
    AUTH_API:"http://localhost:3000/api/auth/",

    // Actor Api
    product:'apps/product',
    productDelete:'apps/product/',

    // Orders Api
    order:'apps/order',
    orderId:'apps/order/',

    // Customers Api
    customer:'apps/customer',
   
    // Actor Api
    actor: 'master/actor',
    actorId: 'master/actor/',

    // Film Api
    film: 'master/film',
    filmId: 'master/film/',

    // Upload and File Api
    upload: 'master/upload',
    image: 'image/'

}