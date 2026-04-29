import { useNavigate } from 'react-router-dom';
import { FileText, Zap, DollarSign, Mail, Twitter, Linkedin, Github, ArrowRight, Check, Users, Calendar, TrendingUp, Shield, Clock, BarChart3, MessageSquare, Star } from 'lucide-react';

export default function OneSyncLanding() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-lg object-cover shadow-sm"
            />
            <span className="text-2xl font-bold text-blue-600">OneSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition font-medium">How it Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition font-medium">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-gray-700 font-medium hover:text-blue-600 transition text-base px-4 py-2">
              Login
            </button>
            <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all text-base">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span className="text-sm font-medium text-blue-700">Trusted by 10,000+ teams worldwide</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[64px] leading-[1.1] font-bold text-gray-900">
              Plan, Execute & Bill -
              <span className="text-blue-600"> All in One Place</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-[540px]">
              Transform your project management with an all-in-one platform that seamlessly connects planning, execution, and billing. Boost productivity by 40% and never miss a billable hour.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:shadow-xl hover:scale-105 transition-all text-base flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/login')} className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-medium hover:border-blue-500 hover:shadow-md transition-all text-base">
                Watch Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">14-day free trial</span>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <img
                src="/laptop.png"
                alt="OneSync dashboard preview"
                className="w-full h-auto object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-100">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">40%</div>
              <div className="text-blue-100">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop juggling multiple tools. OneSync brings together all your project management needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Planning</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Create visual roadmaps, set milestones, and assign tasks with drag-and-drop simplicity.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Gantt charts & timelines
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Resource allocation
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Agile Execution</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kanban boards, sprint planning, and real-time collaboration to keep your team in sync.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Custom workflows
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Time tracking
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auto Billing</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Track time automatically and generate professional invoices with one click.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Invoice templates
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Expense tracking
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Real-time chat, file sharing, and @mentions keep everyone connected.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Team messaging
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  File management
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Gain insights with customizable dashboards and real-time reporting.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Performance metrics
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Custom reports
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Bank-level encryption, SSO, and compliance with SOC 2 and GDPR.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  256-bit encryption
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-600" />
                  Role-based access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-gray-50 py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No complex setup. No training required. Start managing projects like a pro immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Workspace</h3>
              <p className="text-gray-600 leading-relaxed">
                Sign up and set up your team workspace in under 2 minutes. Invite team members instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Build Your Projects</h3>
              <p className="text-gray-600 leading-relaxed">
                Use templates or start from scratch. Add tasks, set deadlines, and assign team members.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track & Invoice</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor progress in real-time and generate invoices automatically based on tracked hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Loved by Teams Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "OneSync transformed how we manage projects. We've cut our admin time by 50% and our clients love the transparency."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Martinez</div>
                  <div className="text-sm text-gray-500">CEO, DesignCo</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The automated billing feature is a game-changer. We never miss billable hours and invoicing takes seconds."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">JC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">James Chen</div>
                  <div className="text-sm text-gray-500">Founder, TechStart</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Best project management tool we've used. Intuitive, powerful, and the support team is incredible."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">EP</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Emily Parker</div>
                  <div className="text-sm text-gray-500">PM, BuildRight</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 10,000+ teams who have streamlined their project management and billing. Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => navigate('/login')} className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 justify-center text-base w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/login')} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all text-base w-full sm:w-auto">
              Schedule a Demo
            </button>
          </div>
          <p className="text-blue-100 mt-6 text-sm">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-5">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-2xl font-bold text-white">OneSync</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Streamlining project management, execution, and billing for modern teams.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-blue-400 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Integrations</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Updates</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Roadmap</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Press</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-blue-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">API Reference</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Community</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Status</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 OneSync. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}