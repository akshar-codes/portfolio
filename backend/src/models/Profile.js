import mongoose from "mongoose";

/* ------------------------------------------------------------------ *
 * Sub-schema — one entry in the social links array
 * ------------------------------------------------------------------ */
const socialLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Social link label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    url: {
      type: String,
      required: [true, "Social link URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [/^https?:\/\/.+/, "URL must be a valid HTTP/HTTPS address"],
    },
    icon: {
      type: String,
      required: [true, "Icon key is required"],
      trim: true,
      lowercase: true,
      maxlength: [40, "Icon key must not exceed 40 characters"],
      match: [
        /^[a-z0-9_-]+$/,
        "Icon key may only contain lowercase letters, numbers, hyphens, and underscores",
      ],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

/* ------------------------------------------------------------------ *
 * Root schema — ONE document per portfolio (singleton pattern)
 * ------------------------------------------------------------------ */
const profileSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      default: "default",
      immutable: true,
      match: [/^[a-z0-9_-]+$/, "Invalid owner value"],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
    },

    title: {
      type: String,
      required: [true, "Title / role is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email must not exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [30, "Phone must not exceed 30 characters"],
    },

    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Location must not exceed 120 characters"],
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Avatar URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Avatar must be empty or a valid HTTP/HTTPS URL",
      ],
    },

    socialLinks: {
      type: [socialLinkSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 10,
        message: "Social links must not exceed 10 entries",
      },
      default: [],
    },
  },
  { timestamps: true },
);

profileSchema.index({ owner: 1 }, { unique: true, sparse: true });

/* ------------------------------------------------------------------ *
 * Static helper — always returns the singleton, creating it if absent
 * ------------------------------------------------------------------ */
profileSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ owner: "default" }).lean();
  if (!doc) {
    doc = await this.create({
      owner: "default",
      name: "Your Name",
      title: "Web Developer",
      email: "you@example.com",
    });
    doc = doc.toObject();
  }
  return doc;
};

export default mongoose.model("Profile", profileSchema);
