from app import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resumes = db.relationship('Resume', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class Resume(db.Model):
    __tablename__ = 'resumes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    raw_text = db.Column(db.Text)
    extracted_skills = db.Column(db.Text)       # JSON list
    job_description = db.Column(db.Text)
    match_score = db.Column(db.Float)
    ats_score = db.Column(db.Float)
    skill_gaps = db.Column(db.Text)             # JSON list
    suggestions = db.Column(db.Text)            # JSON list
    analysis_data = db.Column(db.Text)          # JSON dict
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.original_name,
            'extracted_skills': json.loads(self.extracted_skills) if self.extracted_skills else [],
            'job_description': self.job_description,
            'match_score': self.match_score,
            'ats_score': self.ats_score,
            'skill_gaps': json.loads(self.skill_gaps) if self.skill_gaps else [],
            'suggestions': json.loads(self.suggestions) if self.suggestions else [],
            'analysis_data': json.loads(self.analysis_data) if self.analysis_data else {},
            'created_at': self.created_at.isoformat(),
        }
