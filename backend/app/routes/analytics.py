from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from app.models.models import Resume

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def summary():
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=user_id).order_by(Resume.created_at.desc()).all()

    if not resumes:
        return jsonify({'summary': {}, 'charts': {}}), 200

    scores = [r.match_score or 0 for r in resumes]
    ats_scores = [r.ats_score or 0 for r in resumes]

    # Skill frequency across all resumes
    skill_freq: dict = {}
    for r in resumes:
        for skill in json.loads(r.extracted_skills or '[]'):
            skill_freq[skill] = skill_freq.get(skill, 0) + 1

    top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:10]

    # Score trend (last 10)
    trend = [{
        'name': r.original_name[:20],
        'match_score': r.match_score or 0,
        'ats_score': r.ats_score or 0,
        'date': r.created_at.strftime('%b %d'),
    } for r in reversed(resumes[-10:])]

    summary_data = {
        'total_resumes': len(resumes),
        'avg_match_score': round(sum(scores) / len(scores), 1),
        'avg_ats_score': round(sum(ats_scores) / len(ats_scores), 1),
        'best_match_score': max(scores),
        'total_skills_extracted': sum(len(json.loads(r.extracted_skills or '[]')) for r in resumes),
    }

    charts = {
        'score_trend': trend,
        'top_skills': [{'skill': k, 'count': v} for k, v in top_skills],
        'score_distribution': _score_distribution(scores),
    }

    return jsonify({'summary': summary_data, 'charts': charts}), 200


def _score_distribution(scores):
    buckets = {'0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0}
    for s in scores:
        if s <= 25:
            buckets['0-25'] += 1
        elif s <= 50:
            buckets['26-50'] += 1
        elif s <= 75:
            buckets['51-75'] += 1
        else:
            buckets['76-100'] += 1
    return [{'range': k, 'count': v} for k, v in buckets.items()]
