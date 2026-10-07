---
title: Heart Disease Predictor
start: "2025-06"
end: "2025-09"
context: personal
teamSize: 1
role: Solo
summary: scikit-learn pipeline and Flask app predicting heart disease risk, deployed to AWS and Azure.
metric: 72.24% recall at 25.07% precision (86.16% accuracy) on a 30,000-row stratified held-out set
tags: [Python, scikit-learn, XGBoost, Flask, Docker, AWS, Azure Web App, GitHub Actions]
github: https://github.com/raymondcen/Heart-Disease-Predictor
image:
  src: ../../assets/projects/heart-disease-predictor-eda.png
  alt: "Two bar charts of heart disease counts by age group and by sex. Cases rise with age but stay a small share of every group."
status: archived
order: 20
---

Trains and compares classifiers on Kaggle's Personal Key Indicators of Heart Disease data (target `HadHeartAttack`) and serves predictions through a Flask form. Built to practice the full lifecycle from EDA to cloud deployment.

- Built a modular training pipeline with a stratified 30,000-row test split. It compares Logistic Regression, Random Forest, XGBoost, CatBoost, GradientBoosting and AdaBoost and picks the best by test F1.
- Handled class imbalance with `scale_pos_weight` set from the negative-to-positive ratio. Only about 5.7% of training rows are positive, so predicting "no" for everyone would score about 94% accuracy. Recall is the number that matters here.
- Built a Flask app with a `/predict` route and form templates.
- Deployed three ways: Elastic Beanstalk with CodePipeline; ECR and EC2 through GitHub Actions; an Azure Web App. The deployments are now offline.

**Key decision.** Tuned in stages to balance performance and compute cost: RandomizedSearchCV for broad sweeps, GridSearchCV to refine, then HalvingGridSearchCV for the final run, which starts candidates on 1,000 rows and keeps the top third each round. The winning parameters were then fixed in the model definitions so training no longer reruns the search.
