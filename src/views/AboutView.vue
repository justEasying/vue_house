<template>
  <div class="about-page">
    <nav>
      <div class="logo">
        <p>优设租住</p>
      </div>
      <div class="site-info">
        <a href="#about" class="nav-link" @click.prevent="scrollToSection('about')">关于我们</a>
        <a href="#join" class="nav-link" @click.prevent="scrollToSection('join')">加入我们</a>
        <a href="#" class="nav-link" @click.prevent="router.push('/')">返回首页</a>
      </div>
    </nav>

    <section id="about" class="info">
      <div class="info-bg">
        <img src="/images/租房 APP 文案创作.png" alt="Background">
      </div>
      <div class="info-content">
        <h1 class="info-title">关于我们</h1>
        <p class="info-text">
          依托 OVA 投资基金 2 亿 + 美元优质资产底蕴，我们打造专注品质租房的便捷平台。OVA 深耕多住宅、工业类房产领域，积累了 500 + 多住宅单元及丰富产业配套资源，凭借成熟的价值创造策略与抗经济波动的韧性优势，为你筛选全球范围内稳定、优质的租住选择。我们摒弃传统租房痛点，以创新优化思维适配当代居住需求，让每一次租住都兼具舒适体验与长远价值，成为你安心栖居的可靠伙伴。
        </p>
      </div>
    </section>

    <section class="slider">
      <div class="slider-image" ref="sliderImage"></div>

      <div class="slider-title" ref="sliderTitle">
        <h1></h1>
      </div>

      <div class="slide-indicator">
        <div class="slider-indices" ref="sliderIndices"></div>
        <div class="slider-progress-bar">
          <div class="slider-progress"></div>
        </div>
      </div>
    </section>

    <section id="join" class="outro">
      <div class="outro-bg">
        <img src="/images/租房 APP 文案创作 (6).png" alt="Background">
      </div>
      <div class="outro-content">
        <h1 class="outro-title">加入我们</h1>
        <p class="outro-text">
          深耕全球租住赛道，赋能理想生活 —— 诚邀志同道合的你，加入我们，用专业链接优质资产，用创新重构租房体验！
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const sliderImage = ref(null)
const sliderTitle = ref(null)
const sliderIndices = ref(null)

// 滚动到指定区域
const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

let gsap = null
let ScrollTrigger = null
let SplitText = null
let Lenis = null
let lenisInstance = null
let scrollTriggerInstance = null

const slides = [
  { title: '可持续居住价值，不止是临时栖居', image: '/images/租房 APP 文案创作 (6).png' },
  { title: '2 亿 + 资产背书，租住品质有迹可循', image: '/images/租房 APP 文案创作 (1).png' },
  { title: '500 + 优质房源，多元居住随心选', image: '/images/租房 APP 文案创作 (2).png' },
  { title: '创新优化策略，重构租房舒适体验', image: '/images/租房 APP 文案创作 (3).png' },
  { title: '抗波动韧性资产，居住稳定无顾虑', image: '/images/租房 APP 文案创作 (4).png' },
  { title: '全球视野布局，好房跨城也能寻', image: '/images/租房 APP 文案创作 (5).png' }
]

onMounted(async () => {
  try {
    // 动态导入 GSAP 和 Lenis
    gsap = (await import('gsap')).default || await import('gsap')
    const st = await import('gsap/ScrollTrigger')
    const sp = await import('gsap/SplitText')
    const ln = await import('lenis')
    
    ScrollTrigger = st.ScrollTrigger || st.default
    SplitText = sp.SplitText || sp.default
    Lenis = ln.default || ln

    if (!gsap || !ScrollTrigger || !SplitText || !Lenis) {
      console.warn('动画库加载失败，使用静态模式')
      renderStatic()
      return
    }

    gsap.registerPlugin(ScrollTrigger, SplitText)

    if (ScrollTrigger.normalizeScroll) {
      ScrollTrigger.normalizeScroll(true)
    }

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2
    })
    lenisInstance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenisInstance.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    const pinDistance = window.innerHeight * slides.length
    const progressBar = document.querySelector('.slider-progress')

    let activeSlide = 0
    let currentSplit = null
    let isAnimating = false

    function createIndices() {
      const container = sliderIndices.value
      if (!container) return
      container.innerHTML = ''
      slides.forEach((_, index) => {
        const indexNum = (index + 1).toString().padStart(2, '0')
        const p = document.createElement('p')
        p.dataset.index = index
        p.innerHTML = `
       <span class="marker"></span>
       <span class="index">${indexNum}</span>
       `
        container.appendChild(p)
        if (index === 0) {
          gsap.set(p.querySelector('.index'), { opacity: 1 })
          gsap.set(p.querySelector('.marker'), { scaleX: 1 })
        } else {
          gsap.set(p.querySelector('.index'), { opacity: 0.35 })
          gsap.set(p.querySelector('.marker'), { scaleX: 0 })
        }
      })
    }

    function animateIndicators(index) {
      const container = sliderIndices.value
      if (!container) return
      const indicators = container.querySelectorAll('p')
      indicators.forEach((indicator, i) => {
        const markerElement = indicator.querySelector('.marker')
        const indexElement = indicator.querySelector('.index')
        if (i === index) {
          gsap.to(markerElement, { scaleX: 1, duration: 0.3, ease: 'power2.out' })
          gsap.to(indexElement, { opacity: 1, duration: 0.3, ease: 'power2.out' })
        } else {
          gsap.to(markerElement, { scaleX: 0, duration: 0.3, ease: 'power2.out' })
          gsap.to(indexElement, { opacity: 0.5, duration: 0.3, ease: 'power2.out' })
        }
      })
    }

    function animateNewSlideTitle(index) {
      if (currentSplit) {
        // 先淡出旧标题
        gsap.to(currentSplit.lines, {
          yPercent: -50,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          stagger: 0.05,
          onComplete: () => {
            currentSplit.revert()
            updateTitle(index)
          }
        })
      } else {
        updateTitle(index)
      }
    }
    
    function updateTitle(index) {
      const titleHost = sliderTitle.value
      if (!titleHost) return
      titleHost.innerHTML = `<h1 style="color: #ffffff !important;">${slides[index].title}</h1>`
      const h1Element = titleHost.querySelector('h1')
      if (h1Element) {
        h1Element.style.color = '#ffffff'
        h1Element.style.setProperty('color', '#ffffff', 'important')
      }
      currentSplit = new SplitText(h1Element, { type: 'lines', linesClass: 'line' })
      if (currentSplit.lines) {
        currentSplit.lines.forEach(line => {
          line.style.color = '#ffffff'
          line.style.setProperty('color', '#ffffff', 'important')
        })
      }
      gsap.set(currentSplit.lines, { yPercent: 100, opacity: 0 })
      gsap.to(currentSplit.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08
      })
    }

    function animateNewSlide(index) {
      // 如果正在切换或已经是目标索引，跳过
      if (isAnimating || activeSlide === index) {
        return
      }
      
      isAnimating = true
      const container = sliderImage.value
      if (!container) return
      
      // 先创建新图片，确保图片加载完成后再显示
      const img = document.createElement('img')
      img.src = slides[index].image
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'cover'
      img.style.position = 'absolute'
      img.style.top = '0'
      img.style.left = '0'
      img.alt = `Slide${index + 1}`
      
      // 等待图片加载完成
      const loadImage = new Promise((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = resolve
          img.onerror = resolve
        }
      })
      
      loadImage.then(() => {
        // 获取旧图片
        const oldImages = container.querySelectorAll('img')
        
        // 设置新图片初始状态
        gsap.set(img, { opacity: 0, scale: 1.05 })
        container.appendChild(img)
        
        // 同时执行旧图片淡出和新图片淡入
        const tl = gsap.timeline({
          onComplete: () => {
            // 动画完成后移除旧图片并更新活动索引
            oldImages.forEach((oldImg) => {
              if (oldImg.parentNode) {
                oldImg.remove()
              }
            })
            activeSlide = index
            isAnimating = false
          }
        })
        
        // 旧图片淡出
        if (oldImages.length > 0) {
          tl.to(oldImages, {
            opacity: 0,
            scale: 0.98,
            duration: 0.6,
            ease: 'power2.inOut'
          }, 0)
        }
        
        // 新图片淡入
        tl.to(img, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, 0)
        
        // 同步更新标题和指示器
        animateNewSlideTitle(index)
        animateIndicators(index)
      })
    }

    createIndices()
    animateNewSlide(0)

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: '.slider',
      start: 'top top',
      end: `+=${pinDistance}px`,
      pin: true,
      scrub: 0.5, // 减小 scrub 值，让动画更平滑
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progressBar) {
          gsap.set(progressBar, { scaleY: self.progress })
        }
        const progress = Math.min(Math.max(self.progress, 0), 0.999)
        const slideProgress = progress * slides.length
        // 使用更精确的切换逻辑，避免重复触发
        const current = Math.min(Math.floor(slideProgress + 0.5), slides.length - 1)
        // 只有在索引真正改变且不在动画中时才触发
        if (activeSlide !== current && !isAnimating) {
          animateNewSlide(current)
        }
      }
    })

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refresh)
    window.addEventListener('orientationchange', refresh)
    window.addEventListener('load', refresh)

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh).catch(() => {})
    }

    const firstImg = new Image()
    firstImg.src = slides[0].image
    if (!firstImg.complete) {
      firstImg.onload = refresh
      firstImg.onerror = refresh
    }
  } catch (error) {
    console.error('初始化动画失败:', error)
    renderStatic()
  }
})

onBeforeUnmount(() => {
  if (lenisInstance) {
    lenisInstance.destroy()
  }
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
  }
  if (ScrollTrigger) {
    ScrollTrigger.getAll().forEach((st) => st.kill())
  }
})

function renderStatic() {
  const container = sliderImage.value
  const titleHost = sliderTitle.value
  const indices = sliderIndices.value
  if (container) {
    container.innerHTML = ''
    const img = document.createElement('img')
    img.src = slides[0].image
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'cover'
    img.alt = 'Slide1'
    container.appendChild(img)
  }
  if (titleHost) {
    titleHost.innerHTML = `<h1>${slides[0].title}</h1>`
  }
  if (indices) {
    indices.innerHTML = ''
    slides.forEach((_, i) => {
      const indexNum = (i + 1).toString().padStart(2, '0')
      const p = document.createElement('p')
      p.innerHTML = `<span class="marker" style="transform:scaleX(${i === 0 ? 1 : 0})"></span><span class="index" style="opacity:${i === 0 ? 1 : 0.5}">${indexNum}</span>`
      indices.appendChild(p)
    })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.about-page {
  width: 100%;
  min-height: 100vh;
  background-color: #0f0f0f;
}

body {
  font-family: 'Inter', sans-serif;
}

h1 {
  font-size: 3rem;
  font-weight: 400;
  letter-spacing: -0.1em;
  line-height: 1.2;
  color: #ffffff;
}

p {
  font-family: 'Geist Mono';
  font-size: 0.85rem;
  font-weight: 400;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

nav {
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  z-index: 2;
}

nav p {
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  filter: brightness(1.1);
}

nav .site-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 0.75rem;
  text-transform: uppercase;
  opacity: 1;
  transition: all 0.3s ease;
  position: relative;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  filter: brightness(1.1);
}

.nav-link:hover {
  opacity: 1;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px rgba(255, 255, 255, 0.5);
  filter: brightness(1.3);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: #fff;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

nav .logo {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

section {
  height: 100svh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.info,
.intro,
.outro {
  position: relative;
  padding: 2rem;
  align-content: center;
  background-color: #0f0f0f;
  color: #fff;
  overflow: hidden;
}

/* 首页背景图片 */
.info-bg,
.outro-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.info-bg img,
.outro-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.info-bg::after,
.outro-bg::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

/* 内容容器 */
.info-content,
.outro-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.info h1,
.intro h1,
.outro h1 {
  width: 50%;
  margin: 0 auto;
  text-align: center;
}

.info-title,
.outro-title {
  font-size: 4rem;
  font-weight: 400;
  letter-spacing: -0.05em;
  margin-bottom: 2rem;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3);
  filter: brightness(1.2);
}

.info-text,
.outro-text {
  font-size: 1.2rem;
  line-height: 2;
  color: #ffffff;
  max-width: 900px;
  text-align: center;
  margin: 0 auto;
  padding: 0 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.2);
  filter: brightness(1.1);
}

.slider {
  background-color: #000;
}

.slider-image {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.slider-image::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.35);
}

.slider-image img {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: center;
  will-change: transform, opacity;
}

.slider-title {
  position: absolute;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%);
  width: 50%;
  text-align: center;
  color: #ffffff !important;
  z-index: 1;
}

/* 确保轮播标题文字为纯白色 */
.slider-title,
.slider-title *,
.slider-title h1,
.slider-title h1 *,
.slider .slider-title,
.slider .slider-title *,
.slider .slider-title h1,
.slider .slider-title h1 *,
.slider-title .line,
.slider-title h1 .line,
.slider .slider-title .line {
  color: #ffffff !important;
  text-shadow: none !important;
  filter: none !important;
}

/* 确保所有轮播区域的文字都是白色 */
.slider h1,
.slider p,
.slider .slider-title,
.slider .slider-title h1,
.slider .slider-title h1 *,
.slider .slider-indices p,
.slider section h1,
.slider section .slider-title h1 {
  color: #ffffff !important;
}

/* 针对动态创建的 SplitText 行元素 */
.slider-title .line,
.slider-title h1 .line {
  color: #ffffff !important;
}

.slide-indicator {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 1;
}

.slider-indices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.slider-indices p {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.index {
  position: relative;
  width: 1.25rem;
  display: flex;
  justify-content: center;
  will-change: opacity;
}

.marker {
  position: relative;
  width: 0.75rem;
  height: 1px;
  background-color: #fff;
  transform-origin: right;
  will-change: transform;
  transform: scaleX(0);
}

.slider-progress-bar {
  position: absolute;
  top: 0;
  left: 50%;
  width: 3px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  transform-origin: top;
  will-change: transform;
  transform: translateX(-50%);
  overflow: hidden;
}

.slider-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  transform-origin: top;
  will-change: transform;
  transform: scaleY(0);
}

.line {
  position: relative;
  display: block;
  will-change: transform;
  color: #ffffff !important;
}

.slider-title .line {
  color: #ffffff !important;
}

@media(max-width: 1000px) {
  h1 {
    font-size: 2rem;
    letter-spacing: 0;
  }

  nav {
    display: none;
  }

  .intro h1,
  .outro h1 {
    width: 100%;
  }

  .slider-title {
    top: 5rem;
    left: 0;
    transform: none;
    width: 100%;
    padding: 2rem;
  }

  .slide-indicator {
    top: unset;
    transform: none;
    bottom: 2rem;
  }

  .info-title,
  .outro-title {
    font-size: 2.5rem;
  }

  .info-text,
  .outro-text {
    font-size: 1rem;
    padding: 0 1rem;
  }
}
</style>

