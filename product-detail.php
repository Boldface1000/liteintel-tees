<?php
// Sample product data
$products = [
    1 => [
        'name' => 'Premium T-Shirt #1',
        'price' => 29.99,
        'image' => 'images/3875fb020edb1e7ecfddbf716566a31b.jpg',
        'description' => 'High quality cotton t-shirt with unique design #1.'
    ],
    2 => [
        'name' => 'Premium T-Shirt #2',
        'price' => 34.99,
        'image' => 'images/3875fb020edb1e7ecfddbf716566a31b.jpg',
        'description' => 'High quality cotton t-shirt with unique design #2.'
    ],
];

// Get product ID from query parameter
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

$product = isset($products[$id]) ? $products[$id] : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo $product ? htmlspecialchars($product['name']) : 'Product Not Found'; ?></title>
    <link rel="stylesheet" href="styles.css" />
    <script src="cart-dropdown-toggle.js" defer></script>
</head>
<body>
    <header>
        <a href="index.html"><h1 class="logo">Liteintel Tees</h1></a>
    </header>
    <main style="padding: 2rem;">
        <?php if ($product): ?>
            <h2><?php echo htmlspecialchars($product['name']); ?></h2>
            <img src="<?php echo htmlspecialchars($product['image']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" style="max-width: 300px; width: 100%; height: auto;" />
            <p><strong>Price:</strong> $<?php echo number_format($product['price'], 2); ?></p>
            <p><?php echo htmlspecialchars($product['description']); ?></p>
            <button class="btn add-to-cart-btn" 
                data-product-id="<?php echo $id; ?>" 
                data-product-name="<?php echo htmlspecialchars($product['name']); ?>" 
                data-product-price="<?php echo $product['price']; ?>" 
                data-product-image="<?php echo htmlspecialchars($product['image']); ?>">
                Add to Cart
            </button>
            <a href="index.html" class="btn" style="margin-top: 1rem; display: inline-block;">Back to Shop</a>
        <?php else: ?>
            <h2>Product Not Found</h2>
            <p>The product you are looking for does not exist.</p>
            <a href="index.html" class="btn" style="margin-top: 1rem; display: inline-block;">Back to Shop</a>
        <?php endif; ?>
    </main>
</body>
</html>
