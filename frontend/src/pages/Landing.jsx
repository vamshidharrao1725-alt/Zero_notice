import { useNavigate } from 'react-router-dom';
import { Briefcase, ShieldCheck, Users, Sparkles } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page glass-card">
      <header className="landing-hero">
        <div>
          <h1>Zero Notice, Zero Worry</h1>
          <p>
            A platform for laid-off professionals and recruiters who need talent that can join immediately.
            Sign up, verify your profile, and start hiring or applying with confidence.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Get Started
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </div>
        <aside className="hero-quote glass-card">
          <h3>Quote</h3>
          <p>
            “People who were laid off are ready to start again fast. This is the place to connect them with urgent hiring opportunities.”
          </p>
        </aside>
      </header>

      <section className="landing-features">
        <div className="feature-card">
          <ShieldCheck size={32} />
          <h3>Verified Profiles</h3>
          <p>Company mail verification and status-based search make candidate trust easy.</p>
        </div>
        <div className="feature-card">
          <Briefcase size={32} />
          <h3>Recruiter Ready</h3>
          <p>Recruiters can post jobs anytime and connect directly with immediate joiners.</p>
        </div>
        <div className="feature-card">
          <Users size={32} />
          <h3>Candidate Control</h3>
          <p>Activate your profile only when you want to appear in searches.</p>
        </div>
        <div className="feature-card">
          <Sparkles size={32} />
          <h3>Focused Network</h3>
          <p>No LinkedIn/Naukri lookalike clutter — just zero notice jobs and real people.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
