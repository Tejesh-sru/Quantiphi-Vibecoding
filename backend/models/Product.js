import mongoose from 'mongoose';

/**
 * Valid product categories supported by the platform
 */
export const ALLOWED_CATEGORIES = [
  'Electronics',
  'Apparel',
  'Footwear',
  'Home & Kitchen',
  'Accessories'
];

/**
 * Product Schema
 * Represents the inventory items stored in MongoDB.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [1000, 'Product description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: {
        values: ALLOWED_CATEGORIES,
        message: '{VALUE} is not a valid category'
      },
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    rating: {
      type: Number,
      required: [true, 'Product rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      default: 1
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false, // Using explicit createdAt as requested
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field: imageUrl (ensures seamless backward compatibility with frontend clients)
productSchema.virtual('imageUrl').get(function () {
  return this.image;
});

// Compound indexes for optimal multi-filter query execution performance
productSchema.index({ category: 1, price: 1, rating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
