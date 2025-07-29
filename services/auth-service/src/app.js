const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")
const redis = require("redis")
const passport = require("passport")
const session = require("express-session")
const RedisStore = require("connect-redis")(session)

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const subscriptionRoutes = require("./routes/subscriptions")
const { errorHandler, notFound } = require("./middleware/errorHandler")
const { authenticateToken } = require("./middleware/auth")
const logger = require("./utils/logger")

require("./config/passport")

const app = express()

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err)
})

redisClient.connect()

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/codeplatform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.on("connected", () => {
  logger.info("Connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error:", err)
})

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})

app.use("/api/", limiter)

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
})

app.use("/api/auth/login", authLimiter)
app.use("/api/auth/register", authLimiter)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "auth-service",
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", authenticateToken, userRoutes)
app.use("/api/subscriptions", authenticateToken, subscriptionRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`)
})

module.exports = app
