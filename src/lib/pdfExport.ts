import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { HealthGoals, UserProfile } from '../types';
import type { ReportRangeType } from './dateUtils';
import { calculateAge } from './calculations';
import { toHeightCm, toWeightKg } from './unitConversion';

const DISCLAIMER =
  'This report is generated using general health formulas and self-entered data. It is not medical ' +
  'advice. Please consult a doctor, dietitian, or fitness professional before making major diet, ' +
  'weight, or exercise changes.';

function addTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 14, y);
  return y + 8;
}

function addSectionLabel(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 14, y);
  return y + 6;
}

function addRow(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(label, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(value, 100, y);
  return y + 6;
}

export function exportOnboardingReportPdf(profile: UserProfile, goals: HealthGoals): void {
  const doc = new jsPDF();
  const heightCm = toHeightCm(profile.heightValue, profile.heightUnit);
  const weightKg = toWeightKg(profile.weightValue, profile.weightUnit);
  const age = calculateAge(profile.dob);

  let y = 18;
  y = addTitle(doc, 'Food Intake Tracker — Health Report', y);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 10;

  y = addSectionLabel(doc, 'Profile', y);
  y = addRow(doc, 'Name', profile.name, y);
  y = addRow(doc, 'Age', String(age), y);
  y = addRow(doc, 'Gender', profile.gender.replace(/_/g, ' '), y);
  y = addRow(doc, 'Height', `${heightCm.toFixed(1)} cm`, y);
  y = addRow(doc, 'Weight', `${weightKg.toFixed(1)} kg`, y);
  y += 4;

  y = addSectionLabel(doc, 'Body Metrics', y);
  y = addRow(doc, 'BMI', `${goals.bmi.toFixed(1)}`, y);
  y = addRow(doc, 'BMI Category', goals.bmiCategory, y);
  if (goals.estimatedBodyFatPercentage !== undefined) {
    y = addRow(doc, 'Estimated body fat %', `${goals.estimatedBodyFatPercentage.toFixed(1)}%`, y);
  }
  y = addRow(doc, 'Recommendation', goals.recommendation, y);
  if (goals.weightToLoseKg) y = addRow(doc, 'Weight to lose', `${goals.weightToLoseKg.toFixed(1)} kg`, y);
  if (goals.weightToGainKg) y = addRow(doc, 'Weight to gain', `${goals.weightToGainKg.toFixed(1)} kg`, y);
  y += 4;

  y = addSectionLabel(doc, 'Daily Targets', y);
  y = addRow(doc, 'Calorie target', `${goals.dailyCalorieTarget} kcal`, y);
  y = addRow(doc, 'Protein target', `${goals.proteinTargetG} g`, y);
  y = addRow(doc, 'Carbohydrate target', `${goals.carbsTargetG} g`, y);
  y = addRow(doc, 'Fat target', `${goals.fatTargetG} g`, y);
  y = addRow(doc, 'Fiber target', `${goals.fiberTargetG} g`, y);
  y = addRow(doc, 'Water target', `${goals.waterTargetMl} ml`, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const disclaimerLines = doc.splitTextToSize(DISCLAIMER, 180);
  doc.text(disclaimerLines, 14, y);

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`food-health-report-onboarding-${dateStr}.pdf`);
}

export type PeriodReportSummary = {
  totalCalories: number;
  avgCalories: number;
  avgProteinG: number;
  avgCarbsG: number;
  avgFatG: number;
  avgFiberG: number;
  totalWaterMl: number;
  avgWaterMl: number;
  totalExerciseBurn: number;
  daysTracked: number;
  daysMissed: number;
  totalDays: number;
  goalCompletionPercent: number;
  topFoods: { name: string; count: number }[];
  topExercises: { name: string; count: number }[];
};

function periodReportFilename(type: ReportRangeType, rangeStart: string, rangeEnd: string): string {
  if (type === 'week') return `food-health-report-weekly-${rangeStart}.pdf`;
  if (type === 'month') return `food-health-report-monthly-${rangeStart.slice(0, 7)}.pdf`;
  if (type === 'year') return `food-health-report-yearly-${rangeStart.slice(0, 4)}.pdf`;
  if (type === 'today') return `food-health-report-today-${rangeStart}.pdf`;
  return `food-health-report-custom-${rangeStart}-to-${rangeEnd}.pdf`;
}

export async function exportPeriodReportPdf(opts: {
  type: ReportRangeType;
  rangeStart: string;
  rangeEnd: string;
  profile: UserProfile;
  summary: PeriodReportSummary;
  chartElement?: HTMLElement | null;
}): Promise<void> {
  const { type, rangeStart, rangeEnd, profile, summary, chartElement } = opts;
  const doc = new jsPDF();

  let y = 18;
  y = addTitle(doc, 'Food Intake Tracker — Report', y);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report type: ${type}`, 14, y);
  y += 5;
  doc.text(`Date range: ${rangeStart} to ${rangeEnd}`, 14, y);
  y += 5;
  doc.text(`User: ${profile.name}`, 14, y);
  y += 5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 8;

  y = addSectionLabel(doc, 'Summary', y);
  y = addRow(doc, 'Total calories consumed', `${summary.totalCalories} kcal`, y);
  y = addRow(doc, 'Average daily calories', `${summary.avgCalories} kcal`, y);
  y = addRow(doc, 'Average protein / day', `${summary.avgProteinG} g`, y);
  y = addRow(doc, 'Average carbs / day', `${summary.avgCarbsG} g`, y);
  y = addRow(doc, 'Average fat / day', `${summary.avgFatG} g`, y);
  y = addRow(doc, 'Average fiber / day', `${summary.avgFiberG} g`, y);
  y = addRow(doc, 'Total water consumed', `${summary.totalWaterMl} ml`, y);
  y = addRow(doc, 'Average water / day', `${summary.avgWaterMl} ml`, y);
  y = addRow(doc, 'Total exercise calories burned', `${summary.totalExerciseBurn} kcal`, y);
  y = addRow(doc, 'Best tracking days', `${summary.daysTracked} / ${summary.totalDays}`, y);
  y = addRow(doc, 'Missed tracking days', `${summary.daysMissed} / ${summary.totalDays}`, y);
  y = addRow(doc, 'Goal completion', `${summary.goalCompletionPercent}%`, y);
  y += 4;

  if (summary.topFoods.length > 0) {
    y = addSectionLabel(doc, 'Most Frequently Eaten Foods', y);
    summary.topFoods.forEach((f) => {
      y = addRow(doc, f.name, `${f.count}x`, y);
    });
    y += 4;
  }

  if (summary.topExercises.length > 0) {
    y = addSectionLabel(doc, 'Most Frequent Exercises', y);
    summary.topExercises.forEach((e) => {
      y = addRow(doc, e.name, `${e.count}x`, y);
    });
    y += 4;
  }

  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (y + imgHeight > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 18;
      }
      doc.addImage(imgData, 'PNG', 14, y, imgWidth, imgHeight);
      y += imgHeight + 8;
    } catch {
      // Chart snapshot is best-effort — the text summary above still covers the required data.
    }
  }

  if (y > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    y = 18;
  }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const disclaimerLines = doc.splitTextToSize(DISCLAIMER, 180);
  doc.text(disclaimerLines, 14, y);

  doc.save(periodReportFilename(type, rangeStart, rangeEnd));
}
