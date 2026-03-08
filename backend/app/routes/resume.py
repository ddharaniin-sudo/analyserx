from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os, uuid, json

from app import db
from app.models.models import Resume
from app.utils.pdf_parser import extract_text_from_pdf
from app.utils.analyzer import full_analysis

resume_bp = Blueprint('resume', __name__)

ALLOWED_EXT = {'pdf'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT


@resume_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()

    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['resume']
    jd_text = request.form.get('job_description', '')

    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400

    original_name = file.filename
    safe_name = f"{uuid.uuid4().hex}_{secure_filename(original_name)}"
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, safe_name)
    file.save(file_path)

    # Extract text
    try:
        with open(file_path, 'rb') as f:
            resume_text = extract_text_from_pdf(f)
    except ValueError as e:
        os.remove(file_path)
        return jsonify({'error': str(e)}), 422

    # Run AI analysis
    analysis = full_analysis(resume_text, jd_text)

    # Persist to DB
    resume = Resume(
        user_id=user_id,
        filename=safe_name,
        original_name=original_name,
        raw_text=resume_text,
        extracted_skills=json.dumps(analysis['resume_skills']),
        job_description=jd_text,
        match_score=analysis['match_score'],
        ats_score=analysis['ats_score'],
        skill_gaps=json.dumps(analysis['skill_gaps']),
        suggestions=json.dumps(analysis['suggestions']),
        analysis_data=json.dumps(analysis),
    )
    db.session.add(resume)
    db.session.commit()

    return jsonify({
        'message': 'Resume analysed successfully',
        'resume': resume.to_dict()
    }), 201


@resume_bp.route('/list', methods=['GET'])
@jwt_required()
def list_resumes():
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=user_id).order_by(Resume.created_at.desc()).all()
    return jsonify({'resumes': [r.to_dict() for r in resumes]}), 200


@resume_bp.route('/<int:resume_id>', methods=['GET'])
@jwt_required()
def get_resume(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    return jsonify({'resume': resume.to_dict()}), 200


@resume_bp.route('/<int:resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404

    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], resume.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(resume)
    db.session.commit()
    return jsonify({'message': 'Resume deleted'}), 200


@resume_bp.route('/compare', methods=['POST'])
@jwt_required()
def compare_resumes():
    user_id = get_jwt_identity()
    data = request.get_json()
    ids = data.get('resume_ids', [])

    if len(ids) < 2:
        return jsonify({'error': 'Provide at least 2 resume IDs to compare'}), 400

    resumes = Resume.query.filter(Resume.id.in_(ids), Resume.user_id == user_id).all()
    comparison = [{
        'id': r.id,
        'filename': r.original_name,
        'match_score': r.match_score,
        'ats_score': r.ats_score,
        'skills_count': len(json.loads(r.extracted_skills) if r.extracted_skills else []),
        'skill_gaps_count': len(json.loads(r.skill_gaps) if r.skill_gaps else []),
        'created_at': r.created_at.isoformat(),
    } for r in resumes]

    return jsonify({'comparison': comparison}), 200
