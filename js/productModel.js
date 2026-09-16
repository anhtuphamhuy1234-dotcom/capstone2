class Product {
    constructor(id, name, price, image, description, quantity, categories, alias = "", shortDescription = "", size = []) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.imgLink = image;
        this.description = description;
        this.quantity = quantity;
        this.categories = categories;
        this.alias = alias;
        this.shortDescription = shortDescription;
        this.size = size;
    }
}