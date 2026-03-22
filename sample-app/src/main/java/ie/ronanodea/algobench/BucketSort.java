package ie.ronanodea.algobench;

import java.util.ArrayList;
import java.util.List;

public class BucketSort {
    // Function to implement bucket sort
    public static void bucketSort(int[] arr) {
        if (arr.length <= 1) {
            return; // No need to sort if the array has 1 or no elements
        }

        // Find min and max values to handle negative numbers
        int minValue = arr[0];
        int maxValue = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] < minValue) {
                minValue = arr[i];
            }
            if (arr[i] > maxValue) {
                maxValue = arr[i];
            }
        }

        // Adjust array to start from 0
        int[] shiftedArr = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            shiftedArr[i] = arr[i] - minValue;
        }

        // Number of buckets
        int numberOfBuckets = (int) Math.sqrt(arr.length);
        List<List<Integer>> buckets = new ArrayList<>(numberOfBuckets);

        // Initialize buckets
        for (int i = 0; i < numberOfBuckets; i++) {
            buckets.add(new ArrayList<>());
        }

        // Calculate range for bucket distribution
        int range = maxValue - minValue + 1;

        // Distribute elements into buckets
        for (int num : shiftedArr) {
            int bucketIndex = (int) ((double) num / range * numberOfBuckets);
            buckets.get(Math.min(bucketIndex, numberOfBuckets - 1)).add(num);
        }

        // Sort each bucket using insertion sort
        int index = 0;
        for (List<Integer> bucket : buckets) {
            int[] bucketArray = new int[bucket.size()];
            for (int i = 0; i < bucket.size(); i++) {
                bucketArray[i] = bucket.get(i);
            }

            // Call insertion sort on the bucket
            InsertionSort.insertionSort(bucketArray);

            // Concatenate the sorted buckets (shift back to original values)
            for (int num : bucketArray) {
                arr[index++] = num + minValue;
            }
        }
    }
}